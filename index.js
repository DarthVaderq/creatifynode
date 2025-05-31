import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "./config/passport.js"; 
import authRoutes from "./routes/auth.js"; // Импорт маршрутов
import categoriesRoute from "./routes/categories.js";
import projectRoutes from "./routes/card.js";
import { sendConfirmationEmail } from "./utils/mailer.js";
import profileRoutes from "./routes/profile.js";
import commentsRouter from "./routes/comments.js"
import { Telegraf } from "telegraf";

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

mongoose
  .connect(
    "mongodb+srv://billshifr95:JbGG9uGPV6vnIyiz@cluster0.c0nr3.mongodb.net/REACT-NODE-APP"
  )
  .then(() => console.log("База Данных в порядке"))
  .catch((err) => console.log("База Данных не подключен", err));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/projects", projectRoutes);
app.use("/profile", profileRoutes); // Подключение
app.use("/comments", commentsRouter);

app.use("/categories", categoriesRoute);
// Подключение маршрутов через файл auth.js
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("API работает");
});

// Настройка webhook для Telegraf
if (process.env.NODE_ENV === "production") {
  bot.telegram.setWebhook("https://creatifytech.online/webhook");
  app.use(bot.webhookCallback("/webhook"));
  console.log("Telegraf работает через webhook!");
} else {
  // Для локальной разработки — polling
  bot.launch();
  console.log("Telegraf работает в режиме polling!");
}

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
