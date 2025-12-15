import { Request, Response } from "express";
import Expense from "../models/Expense";
import Unit from "../models/Unit";
import Receipt from "../models/Receipt";
import Condominium from "../models/Condominium";
import { AuthRequest } from "../middleware/authMiddleware";

// --- Expenses ---

export const getAllCondos = async (req: AuthRequest, res: Response) => {
  try {
    const condos = await Condominium.find();
    res.json(condos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching condos", error });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { condominium_id, type, category, description, amount, status } =
      req.body;

    // TODO: Verify user permissions (Admin/Reseller)

    const expense = new Expense({
      condominium_id,
      type,
      category,
      description,
      amount,
      status,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error creating expense", error });
  }
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { condominium_id } = req.params;
    const expenses = await Expense.find({ condominium_id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error });
  }
};

// --- Aliquots / Closing Month ---

export const calculateMonthlyFees = async (req: AuthRequest, res: Response) => {
  try {
    const { condominium_id, billing_period } = req.body; // e.g., '2025-01'

    // 1. Get total expenses for the period
    // Simple filter by month (assuming date is standard ISO)
    // In a real app, use proper date ranges.
    // For now, fetching all active expenses for simplicity of the prompt or standard last month logic.
    // Let's assume the user selects specific expenses or we pull from a date range.
    // Simplifying: User passes list of expenses OR we calculate all "open" expenses.
    // Let's go with: Calculate all expenses in the given month.

    // For PoC: Fetch Expenses created in the billing_period
    // Improving: This logic usually requires a status 'billed' or similar.
    // Let's assume we sum all 'active' expenses for that month.

    const [year, month] = billing_period.split("-");
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const expenses = await Expense.find({
      condominium_id,
      status: "active",
      date: { $gte: startDate, $lte: endDate },
    });

    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Get Condominium settings
    const condominium = await Condominium.findById(condominium_id);
    if (!condominium)
      return res.status(404).json({ message: "Condo not found" });

    // 3. Get All Units
    const units = await Unit.find({ condominium_id });

    // 4. Calculate Share per Unit
    const receipts = [];

    for (const unit of units) {
      let amountToPay = 0;

      if (condominium.settings.calculation_method === "m2") {
        // Assuming aliquot_percentage is stored as 0-100 or 0-1.
        // Let's assume it's percentage (e.g. 5.5 for 5.5%) or ratio (0.055).
        // Seed data used 10 for 10%. Let's assume it is 0-100.
        // Actually, typically the sum of all aliquot_percentages should be 100.
        // Let's use specs.aliquot_percentage / 100 * totalExpense
        amountToPay = (unit.specs.aliquot_percentage / 100) * totalExpense;
      } else {
        // Equitativo
        amountToPay = totalExpense / units.length;
      }

      // Create Receipt
      const receipt = new Receipt({
        unit_id: unit._id,
        condominium_id,
        billing_period,
        total_amount: amountToPay,
        status: "PENDING",
        breakdown: [
          { description: "Gastos Comunes del Mes", amount: amountToPay },
        ],
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
      });

      await receipt.save();
      receipts.push(receipt);

      // Update Unit Balance
      unit.current_balance += amountToPay;
      await unit.save();
    }

    res.json({
      message: "Calculation complete",
      total_expenses: totalExpense,
      receipts_generated: receipts.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error calculating fees", error });
  }
};
