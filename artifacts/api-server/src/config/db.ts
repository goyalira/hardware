import mongoose from "mongoose";
import { logger } from "../lib/logger";

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI must be set. Did you forget to provision a MongoDB database?",
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);

  logger.info("Connected to MongoDB");

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });
}
