import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Загрузка переменных окружения
dotenv.config();

// Настройка транспорта для отправки писем
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Email из переменных окружения
    pass: process.env.EMAIL_PASSWORD, // Пароль/токен приложения
  },
});

/**
 * Отправляет письмо с подтверждением регистрации.
 * @param {string} recipientEmail - Email получателя
 * @param {string} token - Токен подтверждения
 */
export const sendConfirmationEmail = async (recipientEmail, token) => {
  // Формирование ссылки подтверждения
  const confirmationLink = `https://api.creatifytech.online/auth/verify-email/auth/verify-email/${token}`; // Убедитесь, что URL соответствует

  // Конфигурация письма
  const mailOptions = {
    from: `"Ваше Приложение" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "Подтверждение регистрации",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">Добро пожаловать!</h2>
        <p>Для завершения регистрации перейдите по ссылке:</p>
        <a 
          href="${confirmationLink}" 
          style="
            display: inline-block; 
            padding: 12px 24px; 
            background: #3498db; 
            color: white; 
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
          "
        >
          Подтвердить Email
        </a>
        <p style="color: #7f8c8d; font-size: 14px;">
          Если вы не регистрировались, проигнорируйте это письмо.
        </p>
      </div>
    `,
  };

  try {
    // Отправка письма
    await transporter.sendMail(mailOptions);
    console.log(`[✅] Письмо отправлено на ${recipientEmail}`);
  } catch (error) {
    console.error(`[❌] Ошибка отправки: ${error.message}`);
    throw new Error("Не удалось отправить письмо");
  }
};


export const sendGoogleLoginInfo = async (
  recipientEmail,
  fullName,
  password
) => {
  const mailOptions = {
    from: `"Creatify" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "Ваш аккаунт в Creatify",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">Добро пожаловать, ${fullName}!</h2>
        <p>Вы успешно вошли через Google.</p>
        <p>Ваш имя пользователя: <strong>${fullName}</strong></p>
        <p>Ваш пароль для входа: <strong>${password}</strong></p>
        <p style="margin-top: 10px;">Пожалуйста, смените его в настройках профиля.</p>
        <a 
          href="https://creatifytech.online/login" 
          style="
            display: inline-block; 
            padding: 12px 24px; 
            background: #3498db; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px;
          "
        >
          Перейти на сайт creatify
        </a>
        <p style="color: #7f8c8d; font-size: 14px; margin-top: 20px;">
          Если это были не вы — просто проигнорируйте это письмо.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[✅] Письмо с логином отправлено на ${recipientEmail}`);
  } catch (error) {
    console.error(`[❌] Ошибка отправки письма с паролем: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (recipientEmail, token) => {
  const resetLink = `https://creatifytech.online/reset-password/${token}`; // ссылка на фронт

  const mailOptions = {
    from: `"Creatify" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "Сброс пароля",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">Сброс пароля</h2>
        <p>Вы запросили сброс пароля. Перейдите по ссылке ниже, чтобы задать новый пароль:</p>
        <a 
          href="${resetLink}" 
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #e74c3c;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
          "
        >
          Сбросить пароль
        </a>
        <p style="color: #7f8c8d; font-size: 14px;">
          Если вы не запрашивали сброс — просто проигнорируйте это письмо.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[✅] Письмо для сброса отправлено на ${recipientEmail}`);
  } catch (error) {
    console.error(`[❌] Ошибка отправки письма сброса: ${error.message}`);
    throw new Error("Не удалось отправить письмо для сброса");
  }
};
