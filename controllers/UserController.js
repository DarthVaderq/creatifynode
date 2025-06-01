import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../models/User.js";
import { generateEmailToken } from "../utils/emailToken.js";
import { sendConfirmationEmail } from "../utils/mailer.js";

// Маршрут для регистрации
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  try {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        message: "Пользователь с таким email уже существует",
      });
    }
    const existingUserByFullName = await UserModel.findOne({
      fullName: req.body.fullName,
    });
    if (existingUserByFullName) {
      return res.status(400).json({
        message: "Имя пользователя уже занято",
      });
    }
    // Проверяем сложность пароля
    const passwordRegex = /^(?=.*\d).{8,}$/; // Минимум 8 символов, включая цифры
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        message: "Пароль должен содержать не менее 8 символов, включая цифры.",
      });
    }

    // Хэшируем пароль
    const { email, password, firstName, lastName, fullName, avatarUrl } =
      req.body;
    const salt = await bcrypt.genSalt(10);
    const Hash = await bcrypt.hash(password, salt);

    // Создаем нового пользователя
    const doc = new UserModel({
      email: req.body.email,
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: Hash, // Используем переменную Hash
      isVerified: false,
    });

    // Сохраняем пользователя в базу данных
    const user = await doc.save();

    // Генерируем токен для подтверждения email
    const emailToken = generateEmailToken(user._id);

    // Отправляем письмо для подтверждения
    // await sendConfirmationEmail(email, emailToken);

    const token = jwt.sign(
      { userId: user._id }, // Используйте userId вместо id
      process.env.JWT_SECRET,
      { expiresIn: "60d" }
    );

    console.log("Сгенерированный токен:", token);
    const { passwordHash, ...userData } = user._doc;

    // Возвращаем данные пользователя и токен
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
};
//Маршрут для логина
export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден!",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email не подтвержден. Проверьте почту.",
      });
    }
    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "60d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    // Возвращаем данные пользователя и токен
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
};
export const getMe = async (req, res) => {
  try {
    // Используем req.user.id, который должен быть добавлен middleware checkAuth
    const user = await UserModel.findById(req.userId); // Используем req.userId // 🟢 Исправлено на req.user.id

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc;
    res.json(userData); // ✅ Возвращаем данные без passwordHash
  } catch (err) {
    console.error("Ошибка в getMe:", err);
    res.status(500).json({
      message: "Не удалось получить данные пользователя",
    });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);

    // 1. Ищем пользователя по ID из токена
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=user_not_found`
      );
    }

    // 2. Проверяем, не подтвержден ли уже аккаунт
    if (user.isVerified) {
      return res.redirect(`${process.env.CLIENT_URL}/login?verified=already`);
    }

    // 3. Обновляем статус подтверждения
    user.isVerified = true;
    await user.save();

    // 4. Перенаправляем с параметром успеха
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    console.error("Ошибка подтверждения:", err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=invalid_token`);
  }
};
