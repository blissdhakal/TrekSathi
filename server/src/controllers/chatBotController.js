import Chat from "../models/chatbotModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createNewChat = asyncHandler(async (req, res) => {
    const { history } = req.body;
    const user = req.user;

    if (!history || !Array.isArray(history) || history.length === 0) {
        throw new ApiError(400, "History is required and should be a non-empty array");
    }

    const chat = await Chat.create({ history, user });

    if (!chat) {
        throw new ApiError(400, "Failed to create chat");
    }

    res.status(201).json(new ApiResponse(201, chat, "Chat created successfully"));
});

const updateChat = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { history } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
        throw new ApiError(400, "History is required and should be a non-empty array");
    }

    const chat = await Chat.findById(id);

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    chat.history = history;
    await chat.save();

    res.status(200).json(new ApiResponse(200, chat, "Chat updated successfully"));
});


export {createNewChat, updateChat}