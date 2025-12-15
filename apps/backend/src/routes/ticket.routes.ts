import { Router } from "express";
import {
  createTicket,
  getTickets,
  updateTicketStatus,
} from "../controllers/ticketController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.post("/", authenticate, createTicket);
router.get("/:condominium_id", authenticate, getTickets);
router.patch(
  "/:ticketId/status",
  authenticate,
  authorize(["admin_condominio", "super_admin"]),
  updateTicketStatus
);

export default router;
