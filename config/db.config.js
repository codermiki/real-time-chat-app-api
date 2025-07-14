import mongoose from "mongoose";

// Function to connect mongodb database
export const connectDB = async () => {
   //import mongodb URI from environment variables
   const MONGODB_URI = process.env.MONGODB_URI;
   try {
      mongoose.connection.on("connected", () =>
         console.log("Database Connected!")
      );
      await mongoose.connect(`${MONGODB_URI}/chat-app`);
   } catch (error) {
      console.log(error);
   }
};
