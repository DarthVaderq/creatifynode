import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "./config/passport.js";

import authRoutes from "./routes/auth.js";
import categoriesRoute from "./routes/categories.js";
import projectRoutes from "./routes/card.js";
import profileRoutes from "./routes/profile.js";
import commentsRouter from "./routes/comments.js";

import { Telegraf } from "telegraf";

const app = express();
const PORT = process.env.PORT || 4444;

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Успешно подключено к базе данных"))
  .catch((err) => {
    console.error("❌ Ошибка подключения к MongoDB:", err.message);
    process.exit(1); // Завершаем процесс, если база недоступна
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Роуты
app.use("/projects", projectRoutes);
app.use("/profile", profileRoutes);
app.use("/comments", commentsRouter);
app.use("/categories", categoriesRoute);
app.use("/auth", authRoutes);

// Базовый роут
app.get("/", (req, res) => {
  res.send("🎉 API работает");
});

// Telegraf бот
// if (process.env.TELEGRAM_BOT_TOKEN) {
//   const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

//   if (process.env.NODE_ENV === "production") {
//     bot.telegram.setWebhook(`https://${process.env.DOMAIN}/webhook`);
//     app.use(bot.webhookCallback("/webhook"));
//     console.log("🤖 Telegraf работает через webhook");
//   } else {
//     bot.launch()
//       .then(() => console.log("🤖 Telegraf работает в режиме polling"))
//       .catch((err) => console.error("❌ Ошибка запуска бота:", err));
//   }
// } else {
//   console.warn("⚠️ TELEGRAM_BOT_TOKEN не установлен, бот не запущен");
// }

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

