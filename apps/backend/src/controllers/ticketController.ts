import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import { AuthRequest } from "../middleware/authMiddleware";

// --- Tickets (Maintenance & Reservations) ---

export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { condominium_id, type, details } = req.body;
    const user_id = req.user?.id;

    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const ticket = new Ticket({
      condominium_id,
      user_id,
      type,
      details,
      status: "OPEN",
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error creating ticket", error });
  }
};

export const getTickets = async (req: AuthRequest, res: Response) => {
  try {
    const { condominium_id } = req.params;
    // Filters could be added here (e.g. by status, type)
    const tickets = await Ticket.find({ condominium_id }).populate(
      "user_id",
      "profile.first_name profile.last_name"
    );
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket", error });
  }
};
