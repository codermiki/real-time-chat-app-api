import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./config/db.config.js";

// import server port from environment variable
const PORT = process.env.PORT || 5000;

// create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Test route
app.use("/api/v1/status", (req, res) => res.send("Server is live!"));

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
