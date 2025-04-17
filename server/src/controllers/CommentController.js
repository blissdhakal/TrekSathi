import Comment from '../models/Comment.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from 'mongoose';

const AddComment = asyncHandler(async (req, res) => {
    const {  post_id, text } = req.body;
    if (!( post_id && text)) {
        throw new ApiError(400, "All fields are required");
    }
    const newComment = new Comment({ user_id:req.user._id, post_id, text });
    const savedComment = await newComment.save();
    res.status(200).json(new ApiResponse(200, savedComment, "Comment added successfully"));
});

const getAllComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comments = await Comment.aggregate([
      { $match: { post_id: new mongoose.Types.ObjectId(id) } },
      { $sort: { created_at: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'userprofiles',  
          localField: 'user._id',
          foreignField: 'user', 
          as: 'userProfile'  
        }
      },
      { $unwind: { path: '$userProfile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          user_id: 1,
          post_id: 1,
          text: 1,
          upvotes: 1,
          downvotes: 1,
          created_at: 1,
          'user._id': 1,
          'user.fullName': 1,
          'userProfile.profilePicture.url': 1
        }
      }
    ]);
    
    res.status(200).json(new ApiResponse(200, comments, "Comments loaded successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await Comment.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError(404, "Comment not found");
    }
    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});




// Upvote a comment
const upvoteComment = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    
    const { id } = req.params;
    console.log("Upvoting comment with ID:", id); // Log the ID for debugging
    
    // Safely validate the ID
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id.toString())) {
            throw new ApiError(400, "Invalid comment ID");
        }
    } catch (error) {
        console.error("ID validation error:", error);
        throw new ApiError(400, "Invalid comment ID format");
    }

    // Find the comment with proper error handling
    let comment;
    try {
        comment = await Comment.findById(id);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
    } catch (error) {
        console.error("Error finding comment:", error);
        throw new ApiError(500, "Error retrieving comment");
    }
    
    const userId = req.user._id;
    console.log("User ID:", userId);
    
    // Initialize arrays if they don't exist yet (for backward compatibility)
    if (!Array.isArray(comment.upvotes)) {
        comment.upvotes = [];
    }
    
    if (!Array.isArray(comment.downvotes)) {
        comment.downvotes = [];
    }
    
    // Convert userId to string for comparison if needed
    const userIdStr = userId.toString();
    
    // Check if user has already upvoted (safely check includes)
    const hasUpvoted = comment.upvotes.some(id => id.toString() === userIdStr);
    
    // Check if user has already downvoted
    const hasDownvoted = comment.downvotes.some(id => id.toString() === userIdStr);
    
    console.log("Has upvoted:", hasUpvoted);
    console.log("Has downvoted:", hasDownvoted);
    
    // If user has already upvoted, remove the upvote (toggle behavior)
    if (hasUpvoted) {
        await Comment.findByIdAndUpdate(id, {
            $pull: { upvotes: userId }
        });
        return res.status(200).json(new ApiResponse(200, { action: "removed" }, "Upvote removed"));
    }
    
    // If user has downvoted, remove the downvote and add an upvote
    if (hasDownvoted) {
        await Comment.findByIdAndUpdate(id, {
            $pull: { downvotes: userId },
            $push: { upvotes: userId }
        });
        return res.status(200).json(new ApiResponse(200, { action: "changed" }, "Changed downvote to upvote"));
    }
    
    // Otherwise, add an upvote
    await Comment.findByIdAndUpdate(id, {
        $push: { upvotes: userId }
    });
    
    return res.status(200).json(new ApiResponse(200, { action: "added" }, "Upvote added"));
});

// Downvote a comment (with same fixes as upvote)
const downvoteComment = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    
    const { id } = req.params;
    console.log("Downvoting comment with ID:", id);
    
    // Safely validate the ID
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id.toString())) {
            throw new ApiError(400, "Invalid comment ID");
        }
    } catch (error) {
        console.error("ID validation error:", error);
        throw new ApiError(400, "Invalid comment ID format");
    }

    // Find the comment with proper error handling
    let comment;
    try {
        comment = await Comment.findById(id);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
    } catch (error) {
        console.error("Error finding comment:", error);
        throw new ApiError(500, "Error retrieving comment");
    }
    
    const userId = req.user._id;
    
    // Initialize arrays if they don't exist yet (for backward compatibility)
    if (!Array.isArray(comment.upvotes)) {
        comment.upvotes = [];
    }
    
    if (!Array.isArray(comment.downvotes)) {
        comment.downvotes = [];
    }
    
    // Convert userId to string for comparison if needed
    const userIdStr = userId.toString();
    
    // Check if user has already downvoted
    const hasDownvoted = comment.downvotes.some(id => id.toString() === userIdStr);
    
    // Check if user has already upvoted
    const hasUpvoted = comment.upvotes.some(id => id.toString() === userIdStr);
    
    // If user has already downvoted, remove the downvote (toggle behavior)
    if (hasDownvoted) {
        await Comment.findByIdAndUpdate(id, {
            $pull: { downvotes: userId }
        });
        return res.status(200).json(new ApiResponse(200, { action: "removed" }, "Downvote removed"));
    }
    
    // If user has upvoted, remove the upvote and add a downvote
    if (hasUpvoted) {
        await Comment.findByIdAndUpdate(id, {
            $pull: { upvotes: userId },
            $push: { downvotes: userId }
        });
        return res.status(200).json(new ApiResponse(200, { action: "changed" }, "Changed upvote to downvote"));
    }
    
    // Otherwise, add a downvote
    await Comment.findByIdAndUpdate(id, {
        $push: { downvotes: userId }
    });
    
    return res.status(200).json(new ApiResponse(200, { action: "added" }, "Downvote added"));
});



export { AddComment, getAllComment, deleteComment, upvoteComment, downvoteComment };