import express from "express";
import { api } from "./api.js";
api.use(express.static("dist"));
api.listen(process.env.PORT || 3000, () =>
  console.log(
    "QuizPlay server listening on port " + (process.env.PORT || 3000),
  ),
);
