import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

// Controller to signup a new user
export const signup = async (req, res) => {
   const { fullName, email, password, bio } = req.body;

   try {
      // check all details are filled
      if (!fullName || !email || !password || !bio) {
         res.json({
            success: false,
            message: "Missing Details",
         });
      }
      // check if the email already exists
      const user = await User.findOne({ email });
      if (user) {
         res.json({
            success: false,
            message: "Account already exists",
         });
      }
      // Encrypt the user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = bcrypt.hash(password, salt);
      // Create new user
      const newUser = await User.create({
         fullName,
         email,
         password: hashedPassword,
         bio,
      });
      // generate token for a new user
      const token = generateToken(newUser._id);

      res.json({
         success: true,
         message: "Account created successfully",
         data: newUser,
         token,
      });
   } catch (error) {
      console.log(error.message);
      res.json({
         success: false,
         message: error.message,
      });
   }
};
