import express from "express";
import { generateQuizResponse } from "./generateQuiz.js";
export const api = express();
api.post(
  "/api/generate-quiz",
  express.json({ limit: "2mb" }),
  async (req, res) => {
    const result = await generateQuizResponse(req.body, process.env);
    res.status(result.status).json(await result.json());
  },
);
