import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendGoogleLoginInfo } from "../utils/mailer.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4444/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          console.log("Пользователь найден по googleId:", user);
          return done(null, user);
        }

        const email = profile.emails?.[0]?.value || null;
        if (!email) {
          throw new Error("Email не найден в профиле Google");
        }

        user = await User.findOne({ email });
        if (user) {
          console.log("Пользователь найден по email:", user);
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        const avatarUrl = profile.photos?.[0]?.value || "";
        const [firstName, lastName] = profile.displayName
          ? profile.displayName.split(" ")
          : ["", ""];

        const generatedPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const newUser = await User.create({
          googleId: profile.id,
          email,
          fullName: profile.displayName || "No Name",
          firstName,
          lastName,
          avatarUrl,
          isVerified: true,
          passwordHash: hashedPassword,
        });

        console.log("Создан новый пользователь:", newUser);

        // Отправляем письмо с данными
        await sendGoogleLoginInfo(
          newUser.email,
          newUser.fullName,
          generatedPassword
        );

        return done(null, newUser);
      } catch (err) {
        console.error("Ошибка при обработке Google OAuth:", err);
        done(err, null);
      }
    }
  )
);
