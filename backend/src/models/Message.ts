// backend/src/models/Message.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: "A" | "B";
  textEnglish: string;
  textJapanese: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, enum: ["A", "B"], required: true },
  textEnglish: { type: String, required: true },
  textJapanese: { type: String, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 180, // 3 minutes
  },
});

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
