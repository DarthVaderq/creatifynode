import express from "express";
import Project from "../models/Card.js";
import checkAuth from "../utils/checkAuth.js";
import mongoose from "mongoose";
import { uploadWithBody } from "../middleware/upload.js";
const router = express.Router();

// Получить все проекты
router.get("/", async (req, res) => {
  try {
    const { category } = req.query; // ✅ Убираем userId из query
    const userId = req.userId; // ✅ Берем userId из токена

    const filter = category ? { category } : {};
    const projects = await Project.find(filter).populate(
      "user",
      "fullName username"
    );

    const projectsWithLiked = projects.map((project) => ({
      ...project.toObject(),
      liked: userId ? project.likedBy.includes(userId) : false,
    }));

    res.json(projectsWithLiked);
  } catch (err) {
    console.error("Ошибка при загрузке проектов:", err);
    res.status(500).json({ message: "Не удалось загрузить проекты" });
  }
});

// Получить один проект по ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "user",
      "fullName"
    );
    if (!project) {
      return res.status(404).json({ message: "Проект не найден" });
    }
    console.log("Ответ проекта:", project);
    res.json(project);
  } catch (err) {
    console.error("Ошибка при получении проекта:", err);
    res.status(500).json({ message: "Ошибка при загрузке проекта" });
  }
});

// Добавить новый проект
router.post("/", checkAuth, uploadWithBody, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Поля 'title' и 'description' являются обязательными.",
      });
    }

 
    const uploadedFiles = req.files || [];
    const mediaPaths = uploadedFiles.map((file) => `/uploads/${file.filename}`);


    const categories = category ? [category] : [];
    console.log("Загруженные файлы:", uploadedFiles);
    console.log("Медиа-пути:", mediaPaths);
    console.log("Пользователь из middleware:", req.user);

    const newProject = new Project({
      title,
      description,
      images: mediaPaths, // можно переименовать в "media" если хочешь, но тогда меняй и в модели
      user: req.userId,
      category: categories,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error("Ошибка при добавлении проекта:", err);
    res.status(500).json({ message: "Не удалось добавить проект" });
  }
});
router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Проект не найден или не ваш" });
    }

    res.json({ message: "Проект удалён" });
  } catch (err) {
    console.error("Ошибка при удалении проекта:", err);
    res.status(500).json({ message: "Не удалось удалить проект" });
  }
});

// Поставить лайк проекту
router.patch("/:id/like", checkAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Некорректный ID проекта" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    const hasLiked = project.likedBy.includes(userId);
    if (hasLiked) {
      project.likes -= 1;
      project.likedBy.pull(userId);
    } else {
      project.likes += 1;
      project.likedBy.push(userId);
    }

    await project.save();
    const updatedProject = await Project.findById(projectId).populate(
      "user",
      "username"
    );

    res.json(updatedProject); // 💥 Вот здесь возвращаем полный объект
  } catch (err) {
    console.error("Ошибка при обновлении лайков:", err);
    res.status(500).json({ message: "Не удалось обновить лайк" });
  }
});

export default router;
