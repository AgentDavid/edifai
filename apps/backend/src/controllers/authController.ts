import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Condominium from "../models/Condominium";
import Unit from "../models/Unit";
import Subscription from "../models/Subscription";
import { encrypt } from "../utils/encryption";
import { env } from "../config/env";

const JWT_SECRET = env.JWT_SECRET;

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Retrieve condominium_id based on role
    let condominium_id = null;
    if (user.role === "admin_condominio") {
      const condo = await Condominium.findOne({ admin_id: user._id });
      if (condo) condominium_id = condo._id;
    } else if (user.role === "usuario_condominio") {
      // Find the first unit owned by the user (assuming single condo for now)
      const unit = await Unit.findOne({ owner_id: user._id });
      if (unit) condominium_id = unit.condominium_id;
    }

    // Check Subscription Status
    let subscription_status = "active";
    if (condominium_id) {
      const sub = await Subscription.findOne({ condominium_id }).sort({
        start_date: -1,
      });
      if (sub) {
        subscription_status = sub.status;
      } else {
        // If no subscription exists but they have a condo, maybe set to unknown or active (free tier?)
        // For safety, let's keep it 'active' unless found otherwise, or 'no_subscription'
      }
    }

    // Generate Token
    const payload = JSON.stringify({
      id: user._id,
      role: user.role,
      email: user.email,
      condominium_id,
    });
    const encryptedData = encrypt(payload);

    const token = jwt.sign({ data: encryptedData }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        status: user.status,
      },
      condominium_id,
      subscription_status,
    });
  } catch (error) {
    console.error("Login Error", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-password_hash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reconstruct context (condo_id, subscription)
    // Code duplicated from login - consider refactoring into a service
    let condominium_id = null;
    if (user.role === "admin_condominio") {
      const condo = await Condominium.findOne({ admin_id: user._id });
      if (condo) condominium_id = condo._id;
    } else if (user.role === "usuario_condominio") {
      const unit = await Unit.findOne({ owner_id: user._id });
      if (unit) condominium_id = unit.condominium_id;
    }

    let subscription_status = "active";
    if (condominium_id) {
      const sub = await Subscription.findOne({ condominium_id }).sort({
        start_date: -1,
      });
      if (sub) {
        subscription_status = sub.status;
      }
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        status: user.status,
      },
      condominium_id,
      subscription_status,
    });
  } catch (error) {
    console.error("GetMe Error", error);
    res.status(500).json({ message: "Server error" });
  }
};
