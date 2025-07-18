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
   cors: { origin: "*" },
});

// Store online users
export const userSocketMap = {}; //{ userId: socketId }
// Socket.io connection handler
io.on("connection", (socket) => {
   const userId = socket.handshake.query.userId;
   console.log("a user connected", userId);
   if (userId) userSocketMap[userId] = socket.id;

   // emit online user to all connected clients
   io.emit("getOnlineUsers", Object.keys(userSocketMap));

   // Handle user disconnection
   socket.on("disconnect", () => {
      console.log("user disconnected", userId);
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
