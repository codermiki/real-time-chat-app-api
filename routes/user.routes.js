import { Router } from "express";
import {
   isAuthenticated,
   signin,
   signup,
   updateProfile,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.post("/signup", signup);
userRouter.post("/login", signin);
userRouter.post("/update-profile", protect, updateProfile);
userRouter.get("/check-auth", protect, isAuthenticated);

export default userRouter;
