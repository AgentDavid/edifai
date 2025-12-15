import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth.routes";
import condoRoutes from "./routes/condo.routes";
import ticketRoutes from "./routes/ticket.routes";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/condo", condoRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

// Basic Routes
app.get("/api/hello", (req: Request, res: Response) => {
  res.json({
    message: "¡Hola desde el backend!",
    timestamp: new Date().toISOString(),
    status: "success",
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Backend API",
    version: "1.0.0",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/hello`);
});
