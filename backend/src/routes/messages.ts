// backend/src/routes/messages.ts
import express from "express";
import { Message } from "../models/Message";

const router = express.Router();

// Get all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add a message
router.post("/", async (req, res) => {
  try {
    const { sender, textEnglish, textJapanese } = req.body;
    if (!sender || !textEnglish || !textJapanese)
      return res.status(400).json({ error: "Missing fields" });

    const message = new Message({ sender, textEnglish, textJapanese });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update message
router.put("/:id", async (req, res) => {
  try {
    const { textEnglish, textJapanese } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { textEnglish, textJapanese },
      { new: true },
    );
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete message
router.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
