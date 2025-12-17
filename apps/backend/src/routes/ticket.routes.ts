import { Router } from "express";
import {
  createTicket,
  getTickets,
  updateTicketStatus,
} from "../controllers/ticketController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import { validateTenantStatus } from "../middleware/saasMiddleware";

const router = Router();

router.post("/", authenticate, validateTenantStatus, createTicket);
router.get("/:condominium_id", authenticate, getTickets);
router.patch(
  "/:ticketId/status",
  authenticate,
  authorize(["admin_condominio", "super_admin"]),
  validateTenantStatus,
  updateTicketStatus
);

export default router;
