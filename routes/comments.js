import express from "express";
import Comment from "../models/Comment.js";
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.get("/:projectId", async (req, res) => {
  try {
    const comments = await Comment.find({ project: req.params.projectId })
      .populate("user", "fullName avatarUrl")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error("Ошибка при получении комментариев:", err);
    res.status(500).json({ message: "Ошибка при получении комментариев" });
  }
});
router.post("/", checkAuth, async (req, res) => {
  try {
    const { projectId, text } = req.body;
    console.log("Полученные данные:", req.body);
    console.log("ПРИШЛИ ДАННЫЕ:", { projectId, text });
    console.log("ПОЛЬЗОВАТЕЛЬ:", req.userId);
    
      if (!projectId || !text) {
        return res
          .status(400)
          .json({ message: "Поля 'projectId' и 'text' обязательны." });
      }
    const newComment = new Comment({
      project: projectId,
      user: req.userId,
      text,
    });
    console.log("Сохранённый комментарий:", newComment);
    await newComment.save();
    const populatedComment = await newComment.populate(
      "user",
      "fullName avatarUrl"
    );
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("Ошибка при добавлении комментария:", err);
    res.status(500).json({ message: "Ошибка при добавлении комментария" });
  }
});

export default router;
