import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordHash: {
      type: String,
      default: "", 
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    telegramId: {
      type: String,
      unique: true,
      sparse: true, 
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, 
    },
  },
  {
    timestamps: true,
  }
  
);

export default mongoose.model("User", UserSchema);
