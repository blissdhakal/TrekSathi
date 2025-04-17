import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import UserProfile from "../models/user_ProfileModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// Complete the initial profile setup
const completeProfile = asyncHandler(async (req, res) => {
  const { phone, location } = req.body;
  const user = req.user._id;

  // Validate required fields
  if (!phone || !location) {
    throw new ApiError(400, "Phone number and location are required");
  }

  if (!req.file) {
    throw new ApiError(400, "Profile picture is required");
  }

  // Check if profile already exists
  const existingProfile = await UserProfile.findOne({ user });
  if (existingProfile) {
    throw new ApiError(400, "Profile already exists. Please update your profile instead");
  }

  // Upload profile picture to cloudinary
  const localFilePath = req.file.path;
  const uploadResult = await uploadOnCloudinary(localFilePath);

  if (!uploadResult) {
    throw new ApiError(500, "Error uploading profile picture. Please try again");
  }

  // Create profile document
  const profile = await UserProfile.create({
    user,
    profilePicture: {
      publicId: uploadResult.public_id,
      url: uploadResult.url
    },
    contactInfo: {
      phone,
      location
    }
  });

  if (!profile) {
    throw new ApiError(500, "Failed to create profile");
  }

  // Return created profile with user data populated
  const createdProfile = await UserProfile.findById(profile._id).populate("user", "fullName email");

  return res
    .status(201)
    .json(new ApiResponse(201, createdProfile, "Profile created successfully"));
});

// Get user profile details
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find profile with populated user data
  const profile = await UserProfile.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(userId) }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      }
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        profilePicture: 1,
        contactInfo: 1,
        liveLocation: 1,
        age: 1,
        gender: 1,
        bio: 1,
        socialMedia: 1,
        pastTreks: 1,
        trekExperience: 1,
        createdAt: 1,
        updatedAt: 1,
        "userData.fullName": 1,
        "userData.email": 1
      }
    }
  ]);

  if (!profile.length) {
    throw new ApiError(404, "Profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Profile fetched successfully"));
});

// Update profile information (without image)
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { 
    age, 
    gender, 
    bio, 
    contactInfo, 
    socialMedia, 
    pastTreks,
    trekExperience
  } = req.body;

  // Validate request body
  if (!contactInfo && !age && !gender && !bio && !socialMedia && !pastTreks && !trekExperience) {
    throw new ApiError(400, "At least one field is required for update");
  }

  // Find existing profile
  const existingProfile = await UserProfile.findOne({ user: userId });
  if (!existingProfile) {
    throw new ApiError(404, "Profile not found. Please complete your profile setup first");
  }

  // Update profile fields
  const updateFields = {};
  
  if (age !== undefined) updateFields.age = age;
  if (gender !== undefined) updateFields.gender = gender;
  if (bio !== undefined) updateFields.bio = bio;
  if (pastTreks !== undefined) updateFields.pastTreks = pastTreks;
  if (trekExperience !== undefined) updateFields.trekExperience = trekExperience;

  // Handle nested contactInfo object
  if (contactInfo) {
    updateFields.contactInfo = { ...existingProfile.contactInfo };
    if (contactInfo.phone !== undefined) updateFields.contactInfo.phone = contactInfo.phone;
    if (contactInfo.location !== undefined) updateFields.contactInfo.location = contactInfo.location;
  }

  // Handle nested socialMedia object
  if (socialMedia) {
    updateFields.socialMedia = { ...existingProfile.socialMedia };
    if (socialMedia.instagram !== undefined) updateFields.socialMedia.instagram = socialMedia.instagram;
    if (socialMedia.facebook !== undefined) updateFields.socialMedia.facebook = socialMedia.facebook;
    if (socialMedia.twitter !== undefined) updateFields.socialMedia.twitter = socialMedia.twitter;
  }

  // Update document
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: userId },
    { $set: updateFields },
    { new: true }
  ).populate("user", "fullName email");

  if (!updatedProfile) {
    throw new ApiError(500, "Failed to update profile");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile updated successfully"));
});

// Update profile picture only
const updateProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, "Profile picture is required");
  }

  // Find existing profile
  const existingProfile = await UserProfile.findOne({ user: userId });
  if (!existingProfile) {
    throw new ApiError(404, "Profile not found. Please complete your profile setup first");
  }

  // Upload new image to cloudinary
  const localFilePath = req.file.path;
  const uploadResult = await uploadOnCloudinary(localFilePath);

  if (!uploadResult) {
    throw new ApiError(500, "Error uploading profile picture");
  }

  // Delete old image from cloudinary if exists
  if (existingProfile.profilePicture?.publicId) {
    await deleteFromCloudinary(existingProfile.profilePicture.publicId);
  }

  // Update profile with new image
  existingProfile.profilePicture = {
    publicId: uploadResult.public_id,
    url: uploadResult.url
  };

  await existingProfile.save();

  return res
    .status(200)
    .json(new ApiResponse(
      200, 
      {
        profilePicture: existingProfile.profilePicture
      },
      "Profile picture updated successfully"
    ));
});

// Update user's live location
const updateLiveLocation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { liveLocation } = req.body;

  if (!liveLocation) {
    throw new ApiError(400, "Live location is required");
  }

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        liveLocation
      }
    },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Live location updated successfully"));
});

// Get user profile by user ID (for group chats and public profiles)
const getUserProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  console.log("User ID:", userId);
  
  // Validate the userId
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Valid user ID is required");
  }

  // Find profile with populated user data
  const profile = await UserProfile.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(userId) }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      }
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        profilePicture: 1,
        contactInfo: {
          location: 1
        },
        // Only include fields that are safe to share publicly
        age: 1,
        gender: 1,
        bio: 1,
        socialMedia: 1,
        pastTreks: 1,
        trekExperience: 1,
        "userData.fullName": 1
        // Note: email is excluded for privacy
      }
    }
  ]);

  // if (!profile.length) {
  //   throw new ApiError(404, "Profile not found");
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, profile[0], "User profile fetched successfully"));
});

// Get multiple user profiles by IDs (for group members)
const getBatchUserProfiles = asyncHandler(async (req, res) => {
  const { userIds } = req.body;
  
  // Validate the userIds array
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, "Valid user IDs array is required");
  }
  
  // Convert string IDs to ObjectIds and validate
  const objectIds = [];
  for (const id of userIds) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      objectIds.push(new mongoose.Types.ObjectId(id));
    }
  }
  
  if (objectIds.length === 0) {
    throw new ApiError(400, "No valid user IDs provided");
  }

  // Find profiles with populated user data
  const profiles = await UserProfile.aggregate([
    {
      $match: { user: { $in: objectIds } }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      }
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        user: 1,
        profilePicture: 1,
        // Only include fields that are safe to share publicly
        "userData.fullName": 1,
        trekExperience: 1
      }
    }
  ]);

  // Create a map for easier client-side consumption
  const profileMap = profiles.reduce((acc, profile) => {
    acc[profile.user.toString()] = {
      _id: profile._id,
      fullName: profile.userData?.fullName,
      profilePicture: profile.profilePicture,
      trekExperience: profile.trekExperience
    };
    return acc;
  }, {});

  return res
    .status(200)
    .json(new ApiResponse(200, profileMap, "User profiles fetched successfully"));
});

// Check if user has completed profile
const checkProfileCompletion = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Check if profile exists
  const profileExists = await UserProfile.exists({ user: userId });
  
  return res
    .status(200)
    .json(new ApiResponse(200, { profileCompleted: !!profileExists }, 
      profileExists ? "Profile has been completed" : "Profile needs to be completed"));
});




export {
  completeProfile,
  getProfile,
  updateProfile,
  updateProfileImage,
  updateLiveLocation,
  getUserProfileById,
  getBatchUserProfiles,
  checkProfileCompletion
};