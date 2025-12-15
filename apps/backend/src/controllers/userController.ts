import { Request, Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

export const getUsersByRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ message: "Role parameter is required" });
    }

    const users = await User.find({ role }).select("-password_hash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  // Basic user creation separate from auth register (for admins creating other admins/users)
  // TBD if needed immediately, but filling for completeness
  res.status(501).json({ message: "Not implemented yet" });
};
