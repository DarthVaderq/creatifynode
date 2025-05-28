import { Router } from "express";
import checkAuth from "../utils/checkAuth.js";
import { getProfileData, updateProfile } from "../controllers/profileController.js";

const router = Router();

router.get("/", checkAuth, getProfileData);
router.put("/", checkAuth, updateProfile);
export default router;
