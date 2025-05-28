import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { Telegraf } from "telegraf";
import mongoose from "mongoose";
import User from "../models/User.js";

console.log("Токен бота:", process.env.TELEGRAM_BOT_TOKEN); // Проверка токена

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("Подключение к MongoDB успешно"))
  .catch((err) => {
    console.error("Ошибка подключения к MongoDB:", err);
    process.exit(1); // Завершить процесс, если подключение не удалось
  });

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.on("text", async (ctx) => {
  console.log("Получено сообщение:", ctx.message.text); // Логирование

  const message = ctx.message.text;
  const userId = ctx.from.id;

  const nameMatch = message.match(/Имя:\s*(.+)/i);
  const lastNameMatch = message.match(/Фамилия:\s*(.+)/i);
  const emailMatch = message.match(/Email:\s*(.+)/i);
  const passwordMatch = message.match(/Пароль:\s*(.+)/i);

  if (nameMatch && lastNameMatch && emailMatch && passwordMatch) {
    try {
      const password = passwordMatch[1].trim();

      // Хеширование пароля перед сохранением
      const bcrypt = await import("bcrypt");
      const passwordHash = await bcrypt.hash(password, 10);
      console.log("Хешированный пароль:", passwordHash);

      const updatedUser = await User.findOneAndUpdate(
        { telegramId: userId },
        {
          $set: {
            firstName: nameMatch[1].trim(),
            lastName: lastNameMatch[1].trim(),
            fullName: `${nameMatch[1].trim()} ${lastNameMatch[1].trim()}`,
            email: emailMatch[1].trim(),
            passwordHash,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log("Обновлённый пользователь:", updatedUser);

      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: userId,
          text: `✅ Спасибо! Ваши данные успешно прошли регистрацию.\n\n🌐 Перейдите по ссылке: https://creatifytech.online/login\n\n Подтвердите свой данные на сайте Creatify.`,
        }
      );
    } catch (err) {
      console.error("Ошибка при сохранении данных пользователя:", err);
      ctx.reply("Произошла ошибка при сохранении данных. Попробуйте позже.");
    }
  } else {
    ctx.reply(
      "Пожалуйста, отправьте сообщение в правильном формате:\nИмя: ...\nФамилия: ...\nEmail: ...\nПароль: ..."
    );
  }
});

bot.launch();
