import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";


/*
export const handleTelegramAuth = async (req, res) => {
  try {
    const data = req.body;
    const { hash, ...checkData } = data;

    const secret = crypto
      .createHash("sha256")
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();

    const dataCheckString = Object.keys(checkData)
      .sort()
      .map((key) => `${key}=${checkData[key]}`)
      .join("\n");

    const hmac = crypto
      .createHmac("sha256", secret)
      .update(dataCheckString)
      .digest("hex");

    if (hmac !== hash) {
      return res.status(401).json({ error: "Invalid Telegram data" });
    }

    if (!data.id) {
      return res.status(400).json({ message: "Telegram ID обязателен" });
    }

    let user = await User.findOneAndUpdate(
      { telegramId: data.id },
      {
        telegramId: data.id,
        fullName: `${data.first_name || ""} ${data.last_name || ""}`,
        email: "",
        avatarUrl: data.photo_url || "",
        isVerified: true,
      },
      { new: true, upsert: true } // Создаёт запись, если она не существует
    );

    // Отправка сообщения пользователю
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: data.id,
        text: "Привет! Пожалуйста, отправьте своё имя, фамилию, email и придуманный пароль в этом чате.\n\nПример:\nИмя: Иван\nФамилия: Иванов\nEmail: ivan@example.com\nПароль: qwerty123",
      }
    );

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error("Telegram Auth Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};*/
export const handleTelegramAuth = async (req, res) => {
  try {
    const data = req.body;
    const { hash, ...checkData } = data;

    const secret = crypto
      .createHash("sha256")
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();

    const dataCheckString = Object.keys(checkData)
      .sort()
      .map((key) => `${key}=${checkData[key]}`)
      .join("\n");

    const hmac = crypto
      .createHmac("sha256", secret)
      .update(dataCheckString)
      .digest("hex");

    if (hmac !== hash) {
      return res.status(401).json({ error: "Invalid Telegram data" });
    }

    if (!data.id) {
      return res.status(400).json({ message: "Telegram ID обязателен" });
    }

    // Проверяем, существует ли пользователь
    let user = await User.findOne({ telegramId: data.id });

    if (!user) {
      // Создаём нового пользователя, если его нет
      user = new User({
        telegramId: data.id,
        fullName: `${data.first_name || ""} ${data.last_name || ""}`,
        email: "", // Email остаётся пустым, если его нет
        avatarUrl: data.photo_url || "",
        isVerified: true,
      });

      await user.save();

      // Отправляем сообщение только при первом входе
      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: data.id,
          text: "Привет! Пожалуйста, отправьте своё имя, фамилию, email и придуманный пароль в этом чате.\n\nПример:\nИмя: Иван\nФамилия: Иванов\nEmail: ivan@example.com\nПароль: qwerty123",
        }
      );
    } else {
      // Обновляем только те данные, которые могут измениться
      user.fullName = `${data.first_name || ""} ${data.last_name || ""}`;
      user.avatarUrl = data.photo_url || "";
      await user.save();
    }

    // Генерируем токен
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error("Telegram Auth Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email обязателен" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Используем process.env.JWT_SECRET
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ Отправляем email со ссылкой на сброс
    await sendPasswordResetEmail(email, token);

    res.json({ message: "Ссылка для сброса пароля отправлена на почту" });
  } catch (error) {
    console.error("Ошибка при сбросе пароля:", error.message);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
export const handleResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // ХЕШИРУЕМ НОВЫЙ ПАРОЛЬ
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;

    await user.save();

    res.json({ message: "Пароль успешно сброшен" });
  } catch (error) {
    console.error("Ошибка при сбросе пароля:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
