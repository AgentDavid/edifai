import mongoose from "mongoose";
import dotenv from "dotenv";
import argon2 from "argon2";
import { connectDB } from "../src/config/database";
import User from "../src/models/User";
import Condominium from "../src/models/Condominium";
import Unit from "../src/models/Unit";
import Expense from "../src/models/Expense";
import Receipt from "../src/models/Receipt";
import Ticket from "../src/models/Ticket";

dotenv.config();

const seedDB = async () => {
  try {
    await connectDB();
    console.log("Seeding database...");

    // 1. Create Users
    const hashedPassword = await argon2.hash("password123");

    // Super Admin
    const superAdmin = await User.create({
      email: "superadmin@edifai.com",
      password_hash: hashedPassword,
      role: "super_admin",
      profile: {
        first_name: "Super",
        last_name: "Admin",
        phone: "+1234567890",
      },
      preferences: { notifications_channel: "EMAIL" },
    });

    // Reseller
    const reseller = await User.create({
      email: "reseller@edifai.com",
      password_hash: hashedPassword,
      role: "reseller",
      profile: {
        first_name: "Roberto",
        last_name: "Reseller",
        phone: "+1234567891",
      },
    });

    // Condo Admin
    const condoAdmin = await User.create({
      email: "admin@condo.com",
      password_hash: hashedPassword,
      role: "admin_condominio",
      profile: {
        first_name: "Carlos",
        last_name: "Condo",
        phone: "+1234567892",
      },
    });

    // Condo User (Resident)
    const resident = await User.create({
      email: "user@condo.com",
      password_hash: hashedPassword,
      role: "usuario_condominio",
      profile: { first_name: "Juan", last_name: "Perez", phone: "+1234567893" },
    });

    console.log("Users created");

    // 2. Create Condominium
    const condo = await Condominium.create({
      name: "Residencias El Paraiso",
      address: "Av. Principal 123",
      admin_id: condoAdmin._id,
      reseller_id: reseller._id,
      settings: {
        calculation_method: "m2",
        currency: "USD",
        notifications: {
          enabled: true,
          ai_chatbot_enabled: true,
        },
        communication_channels: {
          whatsapp_enabled: true,
          email_enabled: true,
        },
        ai_config: {
          base_prompt:
            "You are a helpful assistant for Residencias El Paraiso.",
          knowledge_base: "Pool is open from 8am to 8pm. Gym is 24/7.",
        },
      },
      amenities: ["Pool", "Gym", "BBQ Area"],
    });

    console.log("Condominium created");

    // 3. Create Unit
    const unit = await Unit.create({
      condominium_id: condo._id,
      unit_number: "1-A",
      owner_id: resident._id,
      specs: { area_m2: 100, aliquot_percentage: 10 },
      current_balance: 0,
    });

    console.log("Unit created");

    // 4. Create Expenses
    await Expense.create({
      condominium_id: condo._id,
      type: "FIXED",
      category: "Maintenance",
      description: "Elevator Maintenance",
      amount: 150.0,
      status: "active",
    });

    await Expense.create({
      condominium_id: condo._id,
      type: "VARIABLE",
      category: "Repairs",
      description: "Lobby Light Repair",
      amount: 50.0,
      status: "active",
    });

    console.log("Expenses created");

    // 5. Create Receipt
    await Receipt.create({
      unit_id: unit._id,
      condominium_id: condo._id,
      billing_period: "2025-11",
      total_amount: 200.0,
      status: "PENDING",
      breakdown: [
        { description: "Common Expenses", amount: 180.0 },
        { description: "Reserve Fund", amount: 20.0 },
      ],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    console.log("Receipt created");

    // 6. Create Ticket
    await Ticket.create({
      condominium_id: condo._id,
      user_id: resident._id,
      type: "MAINTENANCE_REPORT",
      details: { description: "Leaking pipe in kitchen" },
      status: "OPEN",
    });

    console.log("Ticket created");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
