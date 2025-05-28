// utils/emailToken.js
import jwt from "jsonwebtoken";

export const generateEmailToken = (userId) => {
  // Секрет лучше хранить в переменных окружения
  return jwt.sign({ userId }, process.env.EMAIL_SECRET, { expiresIn: "30d" });
};
export const verifyEmailToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET); // Расшифровка токена
    return decoded; // Возвращаем данные из токена (например, userId)
  } catch (error) {
    console.error("Ошибка при проверке токена:", error.message);
    throw new Error("Неверный или истёкший токен.");
  }
};