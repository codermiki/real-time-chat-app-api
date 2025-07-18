import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
   getAllUsers,
   getMessages,
   markMessageSeen,
   sendMessage,
} from "../controllers/message.controller.js";

const messageRouter = Router();

messageRouter.get("/users", protect, getAllUsers);
messageRouter.get("/:id", protect, getMessages);
messageRouter.put("/mark/:id", protect, markMessageSeen);
messageRouter.post("/send/:id", protect, sendMessage);

export default messageRouter;
