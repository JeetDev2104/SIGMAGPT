import express from "express";
import cors from "cors";
import "dotenv/config";
import fetch from 'node-fetch';  // Add this import
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', chatRoutes);

const PORT = process.env.PORT || 3000;

// Ensure DB is connected before starting the server
connectToDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server because DB connection failed:", err);
    process.exit(1);
  });