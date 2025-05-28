import UserModel from "../models/User.js";

const requireVerified = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Подтвердите email, чтобы продолжить." });
    }

    next(); // Всё ок — пропускаем дальше
  } catch (error) {
    console.error("Ошибка при проверке верификации:", error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

export default requireVerified;
