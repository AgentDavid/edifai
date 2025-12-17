import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import Subscription from "../models/Subscription";

export const validateTenantStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Only check state modifying requests
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Super admins bypass this check
  if (req.user?.role === "super_admin") {
    return next();
  }

  const condominium_id = req.user?.condominium_id;

  if (!condominium_id) {
    // If no condominium_id is associated (e.g., reseller or new user), skip check
    return next();
  }

  try {
    // Find the active subscription for this condominium
    // We sort by start_date desc to get the latest attempt or active one
    const subscription = await Subscription.findOne({ condominium_id }).sort({ start_date: -1 });

    if (!subscription) {
       return res.status(403).json({ message: "Access denied. No subscription found for this condominium." });
    }

    if (subscription.status !== "active") {
        return res.status(403).json({ 
            message: "Access denied. Subscription is suspended or past due.",
            reason: subscription.status
        });
    }

    next();
  } catch (error) {
    console.error("SaaS Middleware Error", error);
    res.status(500).json({ message: "Server error verifying subscription status." });
  }
};
