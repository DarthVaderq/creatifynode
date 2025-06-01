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
import commentsRouter from "./routes/comments.js";
import { Telegraf } from "telegraf";
import bot from "./middleware/bot.js"; // Импорт бота
const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const DOMAIN = process.env.DOMAIN || "https://api.creatifytech.online";

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

// CORS: разрешаем публичный фронт и localhost для разработки
const allowedOrigins = [
  "https://creatifytech.online",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // разрешаем запросы без origin (например, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS: Origin not allowed: " + origin), false);
    },
    credentials: true,
  })
);

// Настройка webhook для Telegraf
if (process.env.NODE_ENV === "production") {
  bot.telegram.setWebhook(`${DOMAIN}/webhook`);
  app.use(bot.webhookCallback("/webhook"));
  console.log("Telegraf работает через webhook!");
} else {
  // Для локальной разработки — polling
  bot.launch();
  console.log("Telegraf работает в режиме polling!");
}

const PORT = process.env.PORT || 4444;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Сервер запущен на порту ${PORT}`)
);
// app.listen(4444, () => console.log("Сервер запущен на 4444 порту"));
