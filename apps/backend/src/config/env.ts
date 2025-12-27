import * as dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, required = true): string => {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || "";
};

export const env = {
  PORT: process.env.PORT || 4000,
  MONGODB_URI: getEnv("MONGODB_URI"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  ENCRYPTION_KEY: getEnv("ENCRYPTION_KEY"),
};
