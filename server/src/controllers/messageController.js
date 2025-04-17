import Message from "../models/message.js";
import Group from "../models/group.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import pusher from "../config/pusher.js";

// Get all messages for a specific group
const getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  // Validate groupId
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  // Check if group exists
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if user is a member of the group
  if (!group.isUserMember(req.user._id)) {
    throw new ApiError(403, "You are not a member of this group");
  }

  // Get messages with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const messages = await Message.find({ group: groupId })
    .populate("sender", "username fullName avatarUrl")
    .populate({
      path: "replyTo",
      populate: { path: "sender", select: "username fullName avatarUrl" }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Transform messages for client
  const formattedMessages = messages.map(msg => ({
    _id: msg._id,
    text: msg.content,
    sender: msg.sender._id,
    senderUsername: msg.sender.username || msg.sender.fullName,
    senderAvatar: msg.sender.avatarUrl,
    createdAt: msg.createdAt,
    attachments: msg.attachments,
    replyTo: msg.replyTo ? {
      _id: msg.replyTo._id,
      content: msg.replyTo.content,
      sender: msg.replyTo.sender.username || msg.replyTo.sender.fullName
    } : null
  }));

  // Return messages in chronological order for display (oldest first)
  res.status(200).json(new ApiResponse(
    200, 
    formattedMessages.reverse(),
    "Messages retrieved successfully"
  ));
});

// Send a message to a group
const sendMessage = asyncHandler(async (req, res) => {
  const { groupId, text, replyTo, attachments } = req.body;
  
  // Validate required fields
  if (!groupId || !text) {
    throw new ApiError(400, "Group ID and message text are required");
  }

  // Validate groupId
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  // Check if group exists
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if user is a member of the group
  if (!group.isUserMember(req.user._id)) {
    throw new ApiError(403, "You must be a member of the group to send messages");
  }

  // Create message
  const message = await Message.create({
    content: text,
    sender: req.user._id,
    group: groupId,
    replyTo: replyTo || null,
    attachments: attachments || [],
    readBy: [{ user: req.user._id }]
  });

  // Populate sender info
  await message.populate("sender", "username fullName avatarUrl");

  // Format message for response
  const formattedMessage = {
    _id: message._id,
    text: message.content,
    sender: message.sender._id,
    senderUsername: message.sender.username || message.sender.fullName,
    senderAvatar: message.sender.avatarUrl,
    createdAt: message.createdAt,
    attachments: message.attachments
  };

  // Trigger Pusher event
  try {
    await pusher.trigger(`group-${groupId}`, 'new-message', formattedMessage);
  } catch (error) {
    console.error("Pusher notification failed:", error);
  }

  res.status(201).json(new ApiResponse(
    201,
    formattedMessage,
    "Message sent successfully"
  ));
});

// Edit a message
const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  
  if (!content) {
    throw new ApiError(400, "Message content is required");
  }
  
  // Find the message
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }
  
  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own messages");
  }
  
  // Update the message
  message.content = content;
  message.isEdited = true;
  await message.save();
  
  res.status(200).json(new ApiResponse(
    200,
    message,
    "Message updated successfully"
  ));
});

// Delete a message
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  
  // Find the message
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }
  
  // Check if user is the sender or an admin
  const group = await Group.findById(message.group);
  const isAdmin = group.isUserAdmin(req.user._id);
  
  if (message.sender.toString() !== req.user._id.toString() && !isAdmin) {
    throw new ApiError(403, "You don't have permission to delete this message");
  }
  
  // Delete the message
  await Message.findByIdAndDelete(messageId);
  
  res.status(200).json(new ApiResponse(
    200,
    {},
    "Message deleted successfully"
  ));
});

export {
  getGroupMessages,
  sendMessage,
  editMessage,
  deleteMessage
};