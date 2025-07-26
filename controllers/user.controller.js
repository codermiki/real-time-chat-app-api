import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import cloudinary from "../utils/cloudinary.js";

// Controller to signup a new user
export const signup = async (req, res) => {
   try {
      const {
         fullName,
         email,
         password,
         bio = "I am using SoftChat",
      } = req.body;
      // check all details are filled
      if (!fullName || !email || !password || !bio) {
         return res.json({
            success: false,
            message: "Missing Details",
         });
      }
      // check if the email already exists
      const user = await User.findOne({ email });
      if (user) {
         return res.json({
            success: false,
            message: "Account already exists",
         });
      }
      // Encrypt the user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
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

// Controller to signin a user
export const signin = async (req, res) => {
   try {
      const { email, password } = req.body;
      // check if the email exists
      const user = await User.findOne({ email });
      if (!user) {
         return res.json({
            success: false,
            message: "Account does not exist",
         });
      }

      // verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
         return res.json({
            success: false,
            message: "Invalid email or password",
         });
      }

      // generate token
      const token = generateToken(user._id);
      res.json({
         success: true,
         message: "Signed in successfully",
         data: user,
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

// Controller to check if user is authenticated
export const isAuthenticated = async (req, res) => {
   res.json({
      success: true,
      data: req.user,
   });
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
   try {
      const { profilePic, bio, fullName } = req.body;
      const userId = req.user._id;
      let updatedUser;

      if (!profilePic) {
         updatedUser = await User.findByIdAndUpdate(
            userId,
            { bio, fullName },
            { new: true }
         );
      } else {
         const upload = await cloudinary.uploader.upload(profilePic);

         updatedUser = await User.findByIdAndUpdate(
            userId,
            { bio, fullName, profilePic: upload.secure_url },
            { new: true }
         );
      }

      res.json({
         success: true,
         message: "Update profile successfully",
         data: updatedUser,
      });
   } catch (error) {
      console.log(error.message);
      res.json({
         success: false,
         message: error.message,
      });
   }
};
