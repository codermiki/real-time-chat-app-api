import jwt from "jsonwebtoken";

// Function to generate token for a user
export const generateToken = (userId) => {
   // import jwt secret key
   const JWT_SECRET = process.env.JWT_SECRET;
   const token = jwt.sign({ userId }, JWT_SECRET);
   return token;
};
