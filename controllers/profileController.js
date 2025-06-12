import Project from "../models/Card.js";
import User from "../models/User.js";

export const getProfileData = async (req, res) => {
  try {
    const userId = req.user._id;

    const createdProjects = await Project.find({ user: userId });
    const likedProjects = await Project.find({ likedBy: userId.toString() });

    const user = await User.findById(userId).select("-password");

    res.json({
      user,
      createdProjects,
      likedProjects,
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка при загрузке профиля" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, fullName, avatarUrl, location } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, fullName, avatarUrl, location },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при обновлении профиля" });
  }
};
