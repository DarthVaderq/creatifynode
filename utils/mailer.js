import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Отправка письма с подтверждением регистрации
 */
export const sendConfirmationEmail = async (recipientEmail, token) => {
  const confirmationLink = `${process.env.DOMAIN}/auth/verify-email/${token}`;

  try {
    await resend.emails.send({
      from: "Creatify <support@creatifytech.online>", // работает без верификации домена
      to: recipientEmail,
      subject: "Подтверждение регистрации",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Добро пожаловать!</h2>
          <p>Для завершения регистрации нажмите кнопку ниже:</p>
          <a 
            href="${confirmationLink}"
            style="padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;"
          >
            Подтвердить Email
          </a>
        </div>
      `,
    });

    console.log(`[✅] Подтверждение отправлено на ${recipientEmail}`);
  } catch (error) {
    console.error(`[❌] Ошибка отправки письма: ${error.message}`);
    throw new Error("Не удалось отправить письмо подтверждения");
  }
};

/**
 * Отправка данных после входа через Google
 */
export const sendGoogleLoginInfo = async (
  recipientEmail,
  fullName,
  password
) => {
  try {
    await resend.emails.send({
      from: "Creatify <support@creatifytech.online>",
      to: recipientEmail,
      subject: "Ваш аккаунт в Creatify",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Добро пожаловать, ${fullName}!</h2>
          <p>Вы успешно вошли через Google.</p>
          <p>Ваш логин: <strong>${fullName}</strong></p>
          <p>Ваш пароль: <strong>${password}</strong></p>
          <p>Пожалуйста, смените пароль в настройках профиля.</p>
          <a 
            href="${process.env.DOMAIN}/login"
            style="padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;"
          >
            Перейти на сайт
          </a>
        </div>
      `,
    });

    console.log(`[✅] Google-логин письмо отправлено на ${recipientEmail}`);
  } catch (error) {
    console.error(`[❌] Ошибка отправки: ${error.message}`);
  }
};

/**
 * Отправка письма для сброса пароля
 */
export const sendPasswordResetEmail = async (recipientEmail, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  try {
    await resend.emails.send({
      from: "Creatify <support@creatifytech.online>",
      to: recipientEmail,
      subject: "Сброс пароля",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Сброс пароля</h2>
          <p>Чтобы задать новый пароль, перейдите по ссылке:</p>
          <a 
            href="${resetLink}"
            style="padding: 12px 24px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px;"
          >
            Сбросить пароль
          </a>
          <p style="margin-top: 10px;">Если вы не запрашивали сброс, просто проигнорируйте это письмо.</p>
        </div>
      `,
    });

    console.log(`[✅] Сброс пароля отправлен на ${recipientEmail}`);
  } catch (error) {
    console.error(`[❌] Ошибка отправки сброса пароля: ${error.message}`);
    throw new Error("Не удалось отправить письмо для сброса пароля");
  }
};
