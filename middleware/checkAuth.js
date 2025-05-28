import jwt from "jsonwebtoken";

const checkAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Получаем токен из заголовка
  if (!token) {
    return res.status(401).json({ message: "Нет токена, доступ запрещён" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Проверяем токен
    req.userId = decoded.id; // Добавляем userId в запрос
    next();
  } catch (err) {
    res.status(401).json({ message: "Неверный токен" });
  }
};

export default checkAuth;
