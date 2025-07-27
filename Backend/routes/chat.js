import express from "express";
import Thread from "../models/Thread.js";
import { getOpenAIResponse } from "../utils/openai.js";
const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "xyz",
      messages: [
        {
          role: "user",
          content: "testing new thread",
        },
      ],
    });
    await thread.save();
    res.status(200).json(thread);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

//get all threads
router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({}).sort({ updatedAt: -1 });
    //descending order of updated threads
    res.status(200).json(threads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/thread/:threadId", async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({ threadId });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.status(200).json(thread);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/thread/:threadId", async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOneAndDelete({ threadId });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.status(200).json({ success: "Thread deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) {
    return res
      .status(400)
      .json({ error: "Thread ID and message are required" });
  }
  try {
    let thread = await Thread.findOne({ threadId: threadId });
    if (!thread) {
      thread = new Thread({
        threadId,
        title: message.slice(0, 30),
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });
    } else {
      // update title if still default
      if (thread.title === "New Chat") {
        thread.title = message.slice(0, 30);
      }
      thread.messages.push({
        role: "user",
        content: message,
      });
    }
    const response = await getOpenAIResponse(thread.messages);
    thread.messages.push({
      role: "assistant",
      content: response,
    });
    thread.updatedAt = new Date();
    await thread.save();
    res.status(200).json({ reply: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
