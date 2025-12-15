import { Router } from "express";
import {
  createExpense,
  getExpenses,
  calculateMonthlyFees,
  getAllCondos,
} from "../controllers/condoController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// Expenses
router.get("/", authenticate, authorize(["super_admin"]), getAllCondos);
router.post(
  "/expenses",
  authenticate,
  authorize(["admin_condominio", "super_admin"]),
  createExpense
);
router.get("/:condominium_id/expenses", authenticate, getExpenses);

// Calculations
router.post(
  "/calculate-fees",
  authenticate,
  authorize(["admin_condominio", "super_admin"]),
  calculateMonthlyFees
);

export default router;
