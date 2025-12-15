import { Router } from "express";
import { getUsersByRole } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// Get users by role (e.g., ?role=reseller)
// Only Super Admin can view all users or specific roles
router.get(
  "/",
  authenticate,
  authorize(["super_admin", "reseller", "admin_condominio"]),
  getUsersByRole
);

export default router;
