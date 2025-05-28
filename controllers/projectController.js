// controllers/projectController.js

export const likeProject = async (req, res) => {
  try {
    const userId = req.user.id; // получаем userId из токена, а не из тела запроса
    const project = await Project.findById(req.params.id); 

    if (!project) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    const hasLiked = project.likedBy.includes(userId);

    if (hasLiked) {
      project.likes = Math.max(0, project.likes - 1);
      project.likedBy = project.likedBy.filter((id) => id !== userId);
    } else {
      project.likes += 1;
      project.likedBy.push(userId);
    }

    await project.save();
    res.json({ likes: project.likes, liked: !hasLiked });
  } catch (err) {
    console.error("Ошибка при обновлении лайков:", err);
    res.status(500).json({ message: "Не удалось обновить лайк." });
  }
};
