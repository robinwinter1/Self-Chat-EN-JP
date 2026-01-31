// backend/src/config/db.ts

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const MessageCollection = mongoose.connection.collection("messages");

    // Drop old TTL index 
    const indexes = await MessageCollection.indexes();
    const existingTTL = indexes.find(
      (idx) => idx.name === "timestamp_1" && idx.expireAfterSeconds !== 3600,
    );

    if (existingTTL) {
      console.log("Dropping old TTL index...");
      await MessageCollection.dropIndex("timestamp_1");
      console.log("Old TTL index dropped");
    }

    // Create TTL index if missing
    const ttlExists = indexes.some(
      (idx) => idx.name === "timestamp_1" && idx.expireAfterSeconds === 3600,
    );
    if (!ttlExists) {
      console.log("Creating new TTL index (3 min)...");
      await MessageCollection.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: 3600 },
      );
      console.log(
        "TTL index created: messages will auto-delete after 1 hr",
      );
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
