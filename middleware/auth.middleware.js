import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// middleware to protect routes
export const protect = async (req, res, next) => {
   try {
      const JWT_SECRET = process.env.JWT_SECRET;
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, JWT_SECRET);
      // find user in database
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
         return res.json({
            status: false,
            message: "User not found",
         });
      }
      // add user to request object
      req.user = user;
      next();
   } catch (error) {
      console.log(error.massage);
      res.json({
         status: false,
         message: error.message,
      });
   }
};
