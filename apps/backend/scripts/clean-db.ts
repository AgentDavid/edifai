import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../src/config/database";
import User from "../src/models/User";
import Condominium from "../src/models/Condominium";
import Unit from "../src/models/Unit";
import Expense from "../src/models/Expense";
import Receipt from "../src/models/Receipt";
import Ticket from "../src/models/Ticket";

dotenv.config();

const cleanDB = async () => {
  try {
    await connectDB();
    console.log("Cleaning database...");

    await User.deleteMany({});
    await Condominium.deleteMany({});
    await Unit.deleteMany({});
    await Expense.deleteMany({});
    await Receipt.deleteMany({});
    await Ticket.deleteMany({});

    console.log("Database cleaned successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error cleaning database:", error);
    process.exit(1);
  }
};

cleanDB();
