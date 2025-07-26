import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.config.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";

// import server port from environment variable
const PORT = process.env.PORT || 5000;

// create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io
export const io = new Server(server, {
   cors: {
      origin: "http://localhost:5173", // Vite's dev server
   },
});

// Store online users
export const userSocketMap = {}; //{ userId: socketId }
// Socket.io connection handler
io.on("connection", (socket) => {
   const userId = socket.handshake.query.userId;
   console.log("Socket connected:", socket.id, "from user:", userId);

   if (userId) userSocketMap[userId] = socket.id;

   io.emit("getOnlineUsers", Object.keys(userSocketMap));

   socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id, "user:", userId);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
   });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Route setup
app.use("/v1/status", (req, res) => res.send("Server is live!"));
app.use("/v1/auth", userRoutes);
app.use("/v1/messages", messageRoutes);

// connect to mongodb
await connectDB();

// start server
server.listen(PORT, (error) => {
   if (error) {
      console.log(`failed to start : ${error.message}`);
   } else {
      console.log(`Server is running => http://localhost:${PORT}`);
   }
});
