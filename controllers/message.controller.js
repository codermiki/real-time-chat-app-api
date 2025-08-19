import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { io, userSocketMap } from "../server.js";
import cloudinary from "../utils/cloudinary.js";

// Controller to get all users except logged user
export const getAllUsers = async (req, res) => {
   try {
      const userId = req.user._id;

      // Get all users except the logged-in one
      const users = await User.find({ _id: { $ne: userId } }).select(
         "-password"
      );

      // Attach unseen message counts
      const promises = users.map(async (user) => {
         const unseenCount = await Message.countDocuments({
            senderId: user._id,
            receiverId: userId,
            seen: false,
         });

         return {
            ...user.toObject(), // convert Mongoose doc to plain object
            unseenMessages: unseenCount, // always included (0 if none)
         };
      });

      const mappedUsers = await Promise.all(promises);

      res.json({
         success: true,
         message: "Users retrieved successfully",
         data: mappedUsers,
      });
   } catch (error) {
      console.error(error.message);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// Controller to get all messages for selected user
export const getMessages = async (req, res) => {
   try {
      const { id: selectedUserId } = req.params;
      const userId = req.user._id;

      // get all messages between the selected user and logged user
      const messages = await Message.find({
         $or: [
            {
               senderId: selectedUserId,
               receiverId: userId,
            },
            {
               senderId: userId,
               receiverId: selectedUserId,
            },
         ],
      });

      // set the messages status to seen
      await Message.updateMany(
         {
            senderId: selectedUserId,
            receiverId: userId,
         },
         { seen: true }
      );

      res.json({
         success: true,
         message: "Messages retrieved successfully",
         data: messages,
      });
   } catch (error) {
      console.log(error.message);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// Controller to mark message as seen by message id
export const markMessageSeen = async (req, res) => {
   try {
      const { id } = req.params;
      await Message.findByIdAndUpdate(id, { seen: true });

      res.json({
         success: true,
         message: "Message seen successfully",
      });
   } catch (error) {
      console.log(error.message);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// Controller to send message to selected user
export const sendMessage = async (req, res) => {
   try {
      const { text, image } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;

      let imageUrl = null;
      if (image) {
         // upload image to cloudinary
         const uploadResponse = await cloudinary.uploader.upload(image);
         imageUrl = uploadResponse.secure_url;
      }

      const newMessage = await Message.create({
         text,
         image: imageUrl,
         senderId: senderId,
         receiverId: receiverId,
      });

      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
         io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.json({
         success: true,
         message: "Message sent successfully",
         data: newMessage,
      });
   } catch (error) {
      console.log(error.message);
      res.json({
         success: false,
         message: error.message,
      });
   }
};
