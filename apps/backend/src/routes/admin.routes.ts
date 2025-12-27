import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import {
  provisionTenant,
  getTenants,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/adminController";

const router = Router();

// All routes require super_admin role
router.use(authenticate);
router.use(authorize(["super_admin"]));

// Tenant provisioning
router.post("/provision-tenant", provisionTenant);

// List all tenants
router.get("/tenants", getTenants);

// List all plans (for dropdown)
// List all plans (for dropdown)
router.get("/plans", getPlans);

// Manage plans
router.post("/plans", createPlan);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);

// Manage super admins
router.get("/super-admins", (req, res, next) => {
  // @ts-ignore
  import("../controllers/adminController").then((c) =>
    c.getSuperAdmins(req, res)
  );
});
router.post("/super-admins", (req, res, next) => {
  // @ts-ignore
  import("../controllers/adminController").then((c) =>
    c.createSuperAdmin(req, res)
  );
});
router.put("/super-admins/:id", (req, res, next) => {
  // @ts-ignore
  import("../controllers/adminController").then((c) =>
    c.updateSuperAdmin(req, res)
  );
});
router.delete("/super-admins/:id", (req, res, next) => {
  // @ts-ignore
  import("../controllers/adminController").then((c) =>
    c.deleteSuperAdmin(req, res)
  );
});

export default router;
