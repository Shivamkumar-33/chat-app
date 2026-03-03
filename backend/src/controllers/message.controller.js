import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Get unread counts for each user
    const usersWithUnread = await Promise.all(
      filteredUsers.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          status: { $ne: "read" },
          isDeleted: false,
        });

        return {
          ...user.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json(usersWithUnread);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      isDeleted: false,
    }).sort({ createdAt: 1 });

    // Mark messages as read when user opens conversation
    await Message.updateMany(
      {
        senderId: userToChatId,
        receiverId: myId,
        status: { $ne: "read" },
      },
      { status: "read" }
    );

    // Emit read receipt to sender
    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { readerId: myId });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate message content
    if (!text && !image) {
      return res.status(400).json({ error: "Message text or image is required" });
    }

    // Prevent sending message to self
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    // Validate receiver exists
    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Trim text content
    const trimmedText = text ? text.trim() : null;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: trimmedText,
      image: imageUrl,
      status: "sent",
    });

    await newMessage.save();

    // Update status to delivered if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      newMessage.status = "delivered";
      await newMessage.save();
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only edit your own messages" });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    // Notify receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    message.isDeleted = true;
    await message.save();

    // Notify receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId: message._id });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { query, userId } = req.query;
    const myId = req.user._id;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchUserId = userId || null;

    // Build base query with regex search
    let baseQuery = {
      isDeleted: false,
      text: { $regex: query, $options: "i" },
    };

    // Filter by conversation if searchUserId is provided
    if (searchUserId) {
      baseQuery.$or = [
        { senderId: myId, receiverId: searchUserId },
        { senderId: searchUserId, receiverId: myId },
      ];
    } else {
      baseQuery.$or = [
        { senderId: myId },
        { receiverId: myId },
      ];
    }

    const messages = await Message.find(baseQuery)
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in searchMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
