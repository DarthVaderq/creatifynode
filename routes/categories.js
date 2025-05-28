import express from "express";

const router = express.Router();

// Пример данных категорий
const categories = [
  { id: 1, name: "Всё" },
  { id: 2, name: "UI-UX Дизайн" },
  { id: 3, name: "Мобильные приложения" },
  { id: 4, name: "Веб-приложения" },
  { id: 5, name: "Игровые проекты" },
];

// Эндпоинт для получения категорий
router.get("/", (req, res) => {
  res.json(categories);
});

export default router; // Используем export default
