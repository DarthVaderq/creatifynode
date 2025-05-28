import { body } from "express-validator";

const registerValidation = [
  body("email", "Введите корректный email").isEmail(),
  body("password", "Пароль должен содержать минимум 5 символов").isLength({
    min: 5,
  }),
  
    body(
      "lastName",
      "Фамилия обязательна и должна содержать минимум 2 символа"
    ).isLength({ min: 2 }),
  body(
    "firstName",
    "Имя обязательно и должно содержать минимум 2 символа"
  ).isLength({ min: 2 }),
  body("fullName", "Имя должно содержать минимум 3 символа").isLength({
    min: 3,
  }),
  body("avatarUrl", "Неверный URL").optional().isURL(),
];

export { registerValidation };
