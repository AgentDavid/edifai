import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { decrypt } from "../utils/encryption";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    condominium_id?: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { data: string };
    const decryptedPayload = decrypt(decoded.data);
    req.user = JSON.parse(decryptedPayload);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};
