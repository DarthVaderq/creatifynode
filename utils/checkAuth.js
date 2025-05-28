import jwt from "jsonwebtoken";
import UserModel from "../models/User.js"; // Добавь

export default async (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded._id); // Используем _id
      console.log("Декодированный токен:", decoded);
      if (!user) {
        return res.status(401).json({ message: "Пользователь не найден" });
      }

      if (!user.isVerified) {
        return res.status(403).json({ message: "Подтвердите email" });
      }

      req.user = user; // сохраняем user целиком
      req.userId = user._id;
      next();
    } catch (e) {
      return res.status(401).json({ message: "Нет доступа" });
    }
  } else {
    return res.status(401).json({ message: "Нет доступа" });
  }
};
