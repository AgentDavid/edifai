import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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
