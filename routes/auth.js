import { Router } from "express";
import { registerValidation } from "../validations/auth.js";
import * as UserController from "../controllers/UserController.js";
import { validationResult } from "express-validator";
import { verifyEmailToken } from "../utils/emailToken.js";
import User from "../models/User.js";
import checkAuth from "../utils/checkAuth.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  handleTelegramAuth,
  handleForgotPassword,
  handleResetPassword
} from "../controllers/authController.js";
const router = Router();
// Валидация запроса
const validateRequest = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Регистрация
router.post(
  "/register",
  validateRequest(registerValidation),
  UserController.register
);

// Логин
router.post("/login", UserController.login);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);
// Получить текущего пользователя (требует токен)
router.get("/me", checkAuth, UserController.getMe);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
/*router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign({ _id: req.user._id }, "yourSecret", {
      expiresIn: "7d",
    });
    // Можно редиректнуть с токеном в URL
    res.redirect(`http://localhost:5173/google-success?token=${token}`);
  }
);*/

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.redirect("https://mail.google.com/");
  }
);
router.post("/telegram", handleTelegramAuth);
// Подтверждение email
router.get("/verify-email/:token", async (req, res) => {
  try {
    const decoded = verifyEmailToken(req.params.token);
    console.log("Декодированный токен:", decoded);

    // Обновляем статус пользователя
    await User.findByIdAndUpdate(decoded.userId, { isVerified: true });

    res.redirect(`https://creatifytech.online/login`);
  } catch (error) {
    console.error("Ошибка маршрута подтверждения email:", error.message);
    res.status(400).json({ message: error.message });
  }
});


export default router;
