import mongoose from "mongoose";

// user schema
const userSchema = new mongoose.Schema(
   {
      email: { type: String, required: true, unique: true },
      fullName: { type: String, required: true },
      password: { type: String, required: true, minLength: 6 },
      profilePic: { type: String, default: "" },
      bio: { type: String },
   },
   { timestamps: true }
);

// Create user Modal
const User = mongoose.model("User", userSchema);

export default User;
