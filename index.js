app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/projects", projectRoutes);
app.use("/profile", profileRoutes); // Подключение
app.use("/comments", commentsRouter);

app.use("/categories", categoriesRoute);
// Подключение маршрутов через файл auth.js
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("API работает");
});

// Настройка webhook для Telegraf
// if (process.env.NODE_ENV === "production") {
//   bot.telegram.setWebhook("https://api.creatifytech.online/webhook");
//   app.use(bot.webhookCallback("/webhook"));
//   console.log("Telegraf работает через webhook!");
// } else {
//   // Для локальной разработки — polling
//   bot.launch();
//   console.log("Telegraf работает в режиме polling!");
// }

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
