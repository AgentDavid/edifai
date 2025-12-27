import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import argon2 from "argon2";
import crypto from "crypto";
import User from "../models/User";
import Condominium from "../models/Condominium";
import SaaSPlan from "../models/SaaSPlan";
import Subscription from "../models/Subscription";
import Expense from "../models/Expense";
import Unit from "../models/Unit";
import Receipt from "../models/Receipt";
import { sendWelcomeEmail } from "../services/emailService";

// Validation schemas
const provisionTenantSchema = z.object({
  condoName: z.string().min(1, "Nombre del condominio requerido"),
  condoAddress: z.string().min(1, "Dirección requerida"),
  adminEmail: z.string().email("Email inválido"),
  adminName: z.string().min(1, "Nombre del administrador requerido"),
  adminLastName: z.string().optional().default(""),
  adminPhone: z.string().optional().default(""),
  planId: z.string().min(1, "Plan requerido"),
});

// Generate random password
function generateTempPassword(length = 12): string {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

/**
 * POST /api/admin/provision-tenant
 * Create a new tenant (condominium) with admin user and subscription
 */
export const provisionTenant = async (req: Request, res: Response) => {
  try {
    // Validate input
    const parsed = provisionTenantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      condoName,
      condoAddress,
      adminEmail,
      adminName,
      adminLastName,
      adminPhone,
      planId,
    } = parsed.data;

    // Check if email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Validate plan exists
    const plan = await SaaSPlan.findById(planId);
    if (!plan) {
      return res.status(400).json({ message: "Plan no encontrado" });
    }

    // Generate temp password and hash
    const tempPassword = generateTempPassword();
    const passwordHash = await argon2.hash(tempPassword);

    // 1. Create admin user
    const adminUser = await User.create({
      email: adminEmail,
      password_hash: passwordHash,
      role: "admin_condominio",
      profile: {
        first_name: adminName,
        last_name: adminLastName || "Admin",
        phone: adminPhone || "N/A",
      },
      status: "active",
    });

    if (!adminUser) {
      throw new Error("Failed to create admin user");
    }

    // 2. Create condominium
    const condominium = await Condominium.create({
      name: condoName,
      address: condoAddress,
      admin_id: adminUser._id,
      settings: {
        calculation_method: "equitativo",
        currency: "USD",
        notifications: {
          enabled: true,
          ai_chatbot_enabled: false,
        },
        communication_channels: {
          whatsapp_enabled: false,
          email_enabled: true,
        },
        ai_config: {
          base_prompt: "Eres un asistente virtual para este condominio.",
          knowledge_base: "",
        },
      },
      amenities: [],
    });

    if (!condominium) {
      // Rollback user creation
      await User.findByIdAndDelete(adminUser._id);
      throw new Error("Failed to create condominium");
    }

    // 3. Update user with condominium_id (circular reference)
    await User.findByIdAndUpdate(adminUser._id, {
      condominium_id: condominium._id,
    });

    // 4. Create subscription
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    await Subscription.create({
      condominium_id: condominium._id,
      plan_id: plan._id,
      start_date: new Date(),
      next_billing_date: nextBillingDate,
      status: "active",
      billing_cycle: "monthly",
    });

    // 5. Send welcome email
    await sendWelcomeEmail(adminEmail, condoName, tempPassword);

    res.status(201).json({
      message: "Condominio creado exitosamente",
      data: {
        condominium: {
          _id: condominium._id,
          name: condominium.name,
        },
        admin: {
          _id: adminUser._id,
          email: adminUser.email,
        },
      },
    });
  } catch (error) {
    console.error("Provision Tenant Error:", error);
    res.status(500).json({ message: "Error al crear el condominio", error });
  }
};

/**
 * GET /api/admin/tenants
 * List all condominiums with admin info and subscription status
 */
export const getTenants = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const condominiums = await Condominium.find()
      .populate("admin_id", "email profile status")
      .skip(skip)
      .limit(limit)
      .lean();

    // Get subscription status for each condominium
    const condoIds = condominiums.map((c) => c._id);
    const subscriptions = await Subscription.find({
      condominium_id: { $in: condoIds },
    })
      .populate("plan_id", "name code")
      .lean();

    // Create a map of condo_id to subscription
    const subMap = new Map(
      subscriptions.map((s) => [s.condominium_id.toString(), s])
    );

    const result = condominiums.map((condo) => {
      const sub = subMap.get(condo._id.toString());
      return {
        _id: condo._id,
        name: condo.name,
        address: condo.address,
        admin: condo.admin_id,
        subscription: sub
          ? {
              status: sub.status,
              plan: sub.plan_id,
              next_billing_date: sub.next_billing_date,
            }
          : null,
      };
    });

    const total = await Condominium.countDocuments();

    res.json({
      data: result,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Tenants Error:", error);
    res.status(500).json({ message: "Error al obtener condominios", error });
  }
};

const updateTenantSchema = z.object({
  condoName: z.string().min(1, "Nombre del condominio requerido"),
  condoAddress: z.string().min(1, "Dirección requerida"),
  adminEmail: z.string().email("Email inválido"),
  adminName: z.string().min(1, "Nombre del administrador requerido"),
  adminLastName: z.string().optional().default(""),
  adminPhone: z.string().optional().default(""),
  planId: z.string().min(1, "Plan requerido"),
});

/**
 * PUT /api/admin/tenants/:id
 * Update a tenant (condominium) and its admin user
 */
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateTenantSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      condoName,
      condoAddress,
      adminEmail,
      adminName,
      adminLastName,
      adminPhone,
      planId,
    } = parsed.data;

    // 1. Find Condominium
    const condominium = await Condominium.findById(id);
    if (!condominium) {
      return res.status(404).json({ message: "Condominio no encontrado" });
    }

    // 2. Find Admin User
    const adminUser = await User.findById(condominium.admin_id);
    if (!adminUser) {
      return res
        .status(404)
        .json({ message: "Usuario administrador no encontrado" });
    }

    // 3. Check if new email is taken (if changed)
    if (adminEmail !== adminUser.email) {
      const emailExists = await User.findOne({
        email: adminEmail,
        _id: { $ne: adminUser._id },
      });
      if (emailExists) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }
    }

    // 4. Update Condominium
    condominium.name = condoName;
    condominium.address = condoAddress;
    await condominium.save();

    // 5. Update Admin User
    adminUser.email = adminEmail;
    if (adminUser.profile) {
      adminUser.profile.first_name = adminName;
      adminUser.profile.last_name = adminLastName;
      adminUser.profile.phone = adminPhone || "";
    }
    await adminUser.save();

    // 6. Update Subscription (Plan) if changed
    // Current active subscription
    const currentSubscription = await Subscription.findOne({
      condominium_id: condominium._id,
      status: "active",
    });

    if (
      currentSubscription &&
      currentSubscription.plan_id.toString() !== planId
    ) {
      // Find new plan
      const newPlan = await SaaSPlan.findById(planId);
      if (!newPlan) {
        return res.status(400).json({ message: "Plan no encontrado" });
      }

      currentSubscription.plan_id = newPlan._id;
      await currentSubscription.save();
    } else if (!currentSubscription) {
      const newPlan = await SaaSPlan.findById(planId);
      if (newPlan) {
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        await Subscription.create({
          condominium_id: condominium._id,
          plan_id: newPlan._id,
          start_date: new Date(),
          next_billing_date: nextBillingDate,
          status: "active",
          billing_cycle: "monthly",
        });
      }
    }

    res.json({
      message: "Condominio actualizado exitosamente",
      data: {
        condominium: {
          _id: condominium._id,
          name: condominium.name,
        },
        admin: {
          _id: adminUser._id,
          email: adminUser.email,
        },
      },
    });
  } catch (error) {
    console.error("Update Tenant Error:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar el condominio", error });
  }
};

/**
 * DELETE /api/admin/tenants/:id
 * Delete a tenant (condominium), its admin user, and subscription.
 */
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Find Condominium
    const condominium = await Condominium.findById(id);
    if (!condominium) {
      return res.status(404).json({ message: "Condominio no encontrado" });
    }

    // 2. Delete Subscription(s)
    await Subscription.deleteMany({ condominium_id: id });

    // 3. Delete Admin User
    if (condominium.admin_id) {
      await User.findByIdAndDelete(condominium.admin_id);
    }

    // 4. Delete Condominium
    await Condominium.findByIdAndDelete(id);

    // 5. Delete other related data
    await Expense.deleteMany({ condominium_id: id });
    await Unit.deleteMany({ condominium_id: id });
    await Receipt.deleteMany({ condominium_id: id });

    res.json({ message: "Condominio eliminado exitosamente" });
  } catch (error) {
    console.error("Delete Tenant Error:", error);
    res.status(500).json({ message: "Error al eliminar el condominio", error });
  }
};

/**
 * PATCH /api/admin/tenants/:id/status
 * Enable or disable a tenant (condominium) by updating the admin user and subscription status
 */
export const toggleTenantStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body; // true to enable, false to disable

    if (typeof enabled !== "boolean") {
      return res
        .status(400)
        .json({ message: "Status 'enabled' (boolean) es requerido" });
    }

    const condominium = await Condominium.findById(id);
    if (!condominium) {
      return res.status(404).json({ message: "Condominio no encontrado" });
    }

    const adminUser = await User.findById(condominium.admin_id);
    if (!adminUser) {
      return res
        .status(404)
        .json({ message: "Usuario administrador no encontrado" });
    }

    const newStatus = enabled ? "active" : "inactive";

    // Update Admin User Status
    adminUser.status = enabled ? "active" : "blocked";
    await adminUser.save();

    // Update Subscription Status
    // Note: This logic assumes one active subscription or finding the latest one.
    // Simplifying to update any active/past_due/canceled to new status for this condo.
    const subscriptions = await Subscription.find({ condominium_id: id });
    for (const sub of subscriptions) {
      if (enabled) {
        // If enabling, only re-enable if it was inactive/canceled?
        // Or just set to active.
        sub.status = "active";
      } else {
        // If disabling, set to canceled or past_due? 'canceled' seems appropriate for a "Stop" action.
        sub.status = "canceled";
      }
      await sub.save();
    }

    res.json({
      message: `Condominio ${enabled ? "habilitado" : "deshabilitado"} exitosamente`,
      data: {
        adminStatus: adminUser.status,
      },
    });
  } catch (error) {
    console.error("Toggle Tenant Status Error:", error);
    res
      .status(500)
      .json({ message: "Error al cambiar estado del condominio", error });
  }
};

/**
 * GET /api/admin/plans
 * List all SaaS plans for dropdown
 */
export const getPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await SaaSPlan.find().lean();
    res.json({ data: plans });
  } catch (error) {
    console.error("Get Plans Error:", error);
    res.status(500).json({ message: "Error al obtener planes", error });
  }
};

const planSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  code: z.string().min(1, "Código requerido"),
  monthly_price: z.number().min(0, "Precio debe ser mayor o igual a 0"),
  max_units: z.number().min(1, "Máximo de unidades debe ser mayor a 0"),
  currency: z.string().default("USD"),
  features: z.array(z.string()).default([]),
  ai_features_enabled: z.boolean().default(false),
});

/**
 * POST /api/admin/plans
 * Create a new SaaS plan
 */
export const createPlan = async (req: Request, res: Response) => {
  try {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const plan = await SaaSPlan.create(parsed.data);
    res.status(201).json({ message: "Plan creado", data: plan });
  } catch (error) {
    console.error("Create Plan Error:", error);
    res.status(500).json({ message: "Error al crear plan", error });
  }
};

/**
 * PUT /api/admin/plans/:id
 * Update an existing SaaS plan
 */
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = planSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const plan = await SaaSPlan.findByIdAndUpdate(id, parsed.data, {
      new: true,
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan no encontrado" });
    }

    res.json({ message: "Plan actualizado", data: plan });
  } catch (error) {
    console.error("Update Plan Error:", error);
    res.status(500).json({ message: "Error al actualizar plan", error });
  }
};

/**
 * DELETE /api/admin/plans/:id
 * Delete a SaaS plan
 */
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if plan is used by any subscription
    const subscriptionCount = await Subscription.countDocuments({
      plan_id: id,
      status: "active",
    });

    if (subscriptionCount > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar el plan porque hay suscripciones activas",
      });
    }

    const plan = await SaaSPlan.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan no encontrado" });
    }

    res.json({ message: "Plan eliminado" });
  } catch (error) {
    console.error("Delete Plan Error:", error);
    res.status(500).json({ message: "Error al eliminar plan", error });
  }
};

/**
 * GET /api/admin/super-admins
 * List all super admins
 */
export const getSuperAdmins = async (req: Request, res: Response) => {
  try {
    const superAdmins = await User.find({ role: "super_admin" })
      .select("-password_hash")
      .lean();
    res.json({ data: superAdmins });
  } catch (error) {
    console.error("Get SuperAdmins Error:", error);
    res.status(500).json({ message: "Error al obtener superadmins", error });
  }
};

const superAdminSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().optional(),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
});

/**
 * POST /api/admin/super-admins
 * Create a new super admin
 */
export const createSuperAdmin = async (req: Request, res: Response) => {
  try {
    const parsed = superAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, firstName, lastName, phone, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const passwordHash = await argon2.hash(password);

    const superAdmin = await User.create({
      email,
      password_hash: passwordHash,
      role: "super_admin",
      profile: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || "",
      },
      status: "active",
    });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = superAdmin.toObject();

    res.status(201).json({
      message: "Superadmin creado exitosamente",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Create SuperAdmin Error:", error);
    res.status(500).json({ message: "Error al crear superadmin", error });
  }
};

const updateSuperAdminSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .optional(),
});

/**
 * PUT /api/admin/super-admins/:id
 * Update a super admin
 */
export const updateSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateSuperAdminSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { firstName, lastName, phone, email, password } = parsed.data;

    // Check if email belongs to another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está en uso" });
    }

    const updateData: any = {
      email,
      "profile.first_name": firstName,
      "profile.last_name": lastName,
      "profile.phone": phone || "",
    };

    if (password) {
      updateData.password_hash = await argon2.hash(password);
    }

    const superAdmin = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password_hash");

    if (!superAdmin) {
      return res.status(404).json({ message: "Superadmin no encontrado" });
    }

    res.json({ message: "Superadmin actualizado", data: superAdmin });
  } catch (error) {
    console.error("Update SuperAdmin Error:", error);
    res.status(500).json({ message: "Error al actualizar superadmin", error });
  }
};

/**
 * DELETE /api/admin/super-admins/:id
 * Delete a super admin
 */
export const deleteSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    // Assuming req.user is populated by auth middleware
    const currentUserId = (req as any).user?.userId;
    if (currentUserId === id) {
      return res
        .status(400)
        .json({ message: "No puedes eliminar tu propia cuenta" });
    }

    const superAdmin = await User.findOneAndDelete({
      _id: id,
      role: "super_admin",
    });

    if (!superAdmin) {
      return res.status(404).json({ message: "Superadmin no encontrado" });
    }

    res.json({ message: "Superadmin eliminado" });
  } catch (error) {
    console.error("Delete SuperAdmin Error:", error);
    res.status(500).json({ message: "Error al eliminar superadmin", error });
  }
};
