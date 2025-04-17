import Post from '../models/post.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from 'mongoose';

const AddPost = asyncHandler(async (req, res) => {
    const { text, location, trekId } = req.body;
    if (!text) {
        throw new ApiError(400, "Text field is required");
    }

    let imageUrl = null;
    if (req.file) {
        const uploadResponse = await uploadOnCloudinary(req.file.path);
        if (!uploadResponse) {
            throw new ApiError(500, "Failed to upload image");
        }
        imageUrl = uploadResponse;
    }

    // Convert trekId to ObjectId if provided and valid
    let trekObjectId = null;
    if (trekId && mongoose.Types.ObjectId.isValid(trekId)) {
        trekObjectId = new mongoose.Types.ObjectId(trekId);
    }

    const newPost = new Post({
        user: req.user._id, // assuming req.user._id is already an ObjectId
        location,
        trek: trekObjectId, // now consistently stored as ObjectId (or null)
        image: imageUrl ? {
            publicId: imageUrl.public_id,
            url: imageUrl.url,
        } : null,
        text,
        upvotes: [],
        downvotes: []
    });
    console.log(newPost);

    const savedPost = await newPost.save();
    res.status(201).json(new ApiResponse(201, { postId: savedPost._id }, "Post added successfully"));
});

const DeletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Post ID is required");
    }
    const result = await Post.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError(404, "Post not found");
    }
    res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
});




// Modified getPostsByTrekid function to handle cases where req.user might be undefined
const getPostsByTrekid = asyncHandler(async (req, res) => {
    const { trekId } = req.query;
    
    let matchCondition = {};
    if (trekId) {
        let orClause = [{ trek: trekId }];
        
        // If trekId is a valid ObjectId then add the ObjectId version to the match condition using `new`
        if (mongoose.Types.ObjectId.isValid(trekId)) {
          orClause.push({ trek: new mongoose.Types.ObjectId(trekId) });
        }
        
        matchCondition = { $or: orClause };
    }
    
    // Store the user ID if available, otherwise use a non-existent ID
    const userId = req.user ? req.user._id : new mongoose.Types.ObjectId();
    
    const posts = await Post.aggregate([
        {
            $match: matchCondition // Filter by trek if trekId is provided
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'post_id',
                as: 'comments'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $addFields: {
                commentCount: { $size: '$comments' },
                userFullName: { $arrayElemAt: ['$userDetails.fullName', 0] },
                // Add vote count calculation
                voteCount: { 
                    $subtract: [
                        { $size: { $ifNull: ['$upvotes', []] } },
                        { $size: { $ifNull: ['$downvotes', []] } }
                    ] 
                },
                // Check if current user has voted only if user is authenticated
                hasUpvoted: {
                    $in: [userId, { $ifNull: ['$upvotes', []] }]
                },
                hasDownvoted: {
                    $in: [userId, { $ifNull: ['$downvotes', []] }]
                }
            }
        },
        {
            $sort: { created_at: -1 }
        },
        {
            $project: {
                comments: 0,
                userDetails: 0
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

// Modified upvotePost function to check if user is authenticated
const upvotePost = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    
    const { postId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);
    
    if (!post) {
        throw new ApiError(404, "Post not found");
    }
    
    const userId = req.user._id;
    
    // Check if user has already upvoted
    const hasUpvoted = post.upvotes.includes(userId);
    // Check if user has already downvoted
    const hasDownvoted = post.downvotes.includes(userId);
    
    // If user has already upvoted, remove the upvote (toggle behavior)
    if (hasUpvoted) {
        await Post.findByIdAndUpdate(postId, {
            $pull: { upvotes: userId }
        });
        return res.status(200).json(new ApiResponse(200, { action: "removed" }, "Upvote removed"));
    }
    
    // If user has downvoted, remove the downvote and add an upvote
    if (hasDownvoted) {
        await Post.findByIdAndUpdate(postId, {
            $pull: { downvotes: userId },
            $push: { upvotes: userId }
        });
        return res.status(200).json(new ApiResponse(200, { action: "changed" }, "Changed downvote to upvote"));
    }
    
    // Otherwise, add an upvote
    await Post.findByIdAndUpdate(postId, {
        $push: { upvotes: userId }
    });
    
    return res.status(200).json(new ApiResponse(200, { action: "added" }, "Upvote added"));
});

// Modified downvotePost function to check if user is authenticated
const downvotePost = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    
    const { postId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);
    
    if (!post) {
        throw new ApiError(404, "Post not found");
    }
    
    const userId = req.user._id;
    
    // Check if user has already downvoted
    const hasDownvoted = post.downvotes.includes(userId);
    // Check if user has already upvoted
    const hasUpvoted = post.upvotes.includes(userId);
    
    // If user has already downvoted, remove the downvote (toggle behavior)
    if (hasDownvoted) {
        await Post.findByIdAndUpdate(postId, {
            $pull: { downvotes: userId }
        });
        return res.status(200).json(new ApiResponse(200, { action: "removed" }, "Downvote removed"));
    }
    
    // If user has upvoted, remove the upvote and add a downvote
    if (hasUpvoted) {
        await Post.findByIdAndUpdate(postId, {
            $pull: { upvotes: userId },
            $push: { downvotes: userId }
        });
        return res.status(200).json(new ApiResponse(200, { action: "changed" }, "Changed upvote to downvote"));
    }
    
    // Otherwise, add a downvote
    await Post.findByIdAndUpdate(postId, {
        $push: { downvotes: userId }
    });
    
    return res.status(200).json(new ApiResponse(200, { action: "added" }, "Downvote added"));
});

export { 
    AddPost, 
    getPostsByTrekid, 
    DeletePost,
    upvotePost,
    downvotePost 
};