import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true }, // URL изображения
  category: { type: [String], required: true }, // Массив категорий
  likes: { type: Number, default: 0 }, // Количество лайков
  likedBy: { type: [String], default: [] }, // Список пользователей, которые поставили лайк
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Project", ProjectSchema);
