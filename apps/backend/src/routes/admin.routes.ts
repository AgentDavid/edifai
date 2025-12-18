import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import {
  provisionTenant,
  getTenants,
  getPlans,
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
router.get("/plans", getPlans);

export default router;
