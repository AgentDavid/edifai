import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import argon2 from "argon2";
import crypto from "crypto";
import User from "../models/User";
import Condominium from "../models/Condominium";
import SaaSPlan from "../models/SaaSPlan";
import Subscription from "../models/Subscription";
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
  const session = await mongoose.startSession();
  session.startTransaction();

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
    const existingUser = await User.findOne({ email: adminEmail }).session(
      session
    );
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Validate plan exists
    const plan = await SaaSPlan.findById(planId).session(session);
    if (!plan) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Plan no encontrado" });
    }

    // Generate temp password and hash
    const tempPassword = generateTempPassword();
    const passwordHash = await argon2.hash(tempPassword);

    // 1. Create admin user
    const adminUsers = await User.create(
      [
        {
          email: adminEmail,
          password_hash: passwordHash,
          role: "admin_condominio",
          profile: {
            first_name: adminName,
            last_name: adminLastName || "Admin",
            phone: adminPhone || "N/A",
          },
          status: "active",
        },
      ],
      { session }
    );
    const adminUser = adminUsers[0];
    if (!adminUser) {
      throw new Error("Failed to create admin user");
    }

    // 2. Create condominium
    const condominiums = await Condominium.create(
      [
        {
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
        },
      ],
      { session }
    );
    const condominium = condominiums[0];
    if (!condominium) {
      throw new Error("Failed to create condominium");
    }

    // 3. Update user with condominium_id (circular reference)
    await User.findByIdAndUpdate(
      adminUser._id,
      { condominium_id: condominium._id },
      { session }
    );

    // 4. Create subscription
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    await Subscription.create(
      [
        {
          condominium_id: condominium._id,
          plan_id: plan._id,
          start_date: new Date(),
          next_billing_date: nextBillingDate,
          status: "active",
          billing_cycle: "monthly",
        },
      ],
      { session }
    );

    // 5. Send welcome email
    await sendWelcomeEmail(adminEmail, condoName, tempPassword);

    // Commit transaction
    await session.commitTransaction();

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
    await session.abortTransaction();
    console.error("Provision Tenant Error:", error);
    res.status(500).json({ message: "Error al crear el condominio", error });
  } finally {
    session.endSession();
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
