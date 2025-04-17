import Group from "../models/group.js";
import User from "../models/userModel.js";
import Message from "../models/message.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create a new group
export const createGroup = asyncHandler(async (req, res) => {
  const {
    name,
    trekRoute,
    description,
    startDate,
    endDate,
    groupSize,
    additionalMembers,
    genderPreference,
    ageFrom,
    ageTo
  } = req.body;

  // Validate required fields
  if (!name || !trekRoute || !startDate || !endDate || !groupSize) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Create the group
  const group = await Group.create({
    name,
    trekRoute,
    description: description || "",
    createdBy: req.user._id,
    trekDetails: {
      startDate,
      endDate,
      groupSize: parseInt(groupSize),
      additionalMembers: parseInt(additionalMembers || 0),
      genderPreference: genderPreference || "any",
      ageFrom: ageFrom ? parseInt(ageFrom) : undefined,
      ageTo: ageTo ? parseInt(ageTo) : undefined
    }
  });

  // Add group to user's joined groups
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { joinedGroups: group._id }
    }
  );

  // Create system message for group creation
  await Message.create({
    content: `${req.user.fullName} created this group`,
    sender: req.user._id,
    group: group._id,
    isSystemMessage: true
  });

  return res
    .status(201)
    .json(new ApiResponse(201, group, "Group created successfully"));
});

// Get all available groups
export const getAllGroups = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    isOpen,
    sortBy = "createdAt",
    sortOrder = "desc",
    startDateFrom,
    startDateTo
  } = req.query;

  const queryObj = { isOpen: isOpen === "false" ? false : true };

  // Search by name or trek route
  if (search) {
    queryObj.$or = [
      { name: { $regex: search, $options: "i" } },
      { trekRoute: { $regex: search, $options: "i" } }
    ];
  }

  // Filter by date range
  if (startDateFrom || startDateTo) {
    queryObj["trekDetails.startDate"] = {};
    if (startDateFrom) {
      queryObj["trekDetails.startDate"].$gte = new Date(startDateFrom);
    }
    if (startDateTo) {
      queryObj["trekDetails.startDate"].$lte = new Date(startDateTo);
    }
  }

  // Sort configuration
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const groups = await Group.find(queryObj)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("createdBy", "fullName email profilePicture")
    .populate("members.user", "fullName email profilePicture");

  const totalGroups = await Group.countDocuments(queryObj);

  return res.status(200).json(
    new ApiResponse(200, {
      groups,
      totalGroups,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalGroups / parseInt(limit))
    }, "Groups retrieved successfully")
  );
});

// Get group by ID
export const getGroupById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  
  if (!mongoose.isValidObjectId(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Group.findById(groupId)
    .populate("createdBy", "fullName email profilePicture")
    .populate("members.user", "fullName email profilePicture gender age trekExperience")
    .populate({
      path: "pinned",
      select: "content createdAt",
      populate: {
        path: "sender",
        select: "fullName profilePicture"
      }
    });

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Group details retrieved successfully"));
});

// Join a group
export const joinGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  
  if (!mongoose.isValidObjectId(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Group.findById(groupId);
  
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.isOpen) {
    throw new ApiError(403, "This group is not open for new members");
  }

  if (group.isFull) {
    throw new ApiError(400, "This group is already full");
  }

  // Check if user is already a member
  const isMember = group.members.some(member => 
    member.user.toString() === req.user._id.toString()
  );

  if (isMember) {
    throw new ApiError(400, "You are already a member of this group");
  }

  // Check gender preference if applicable
  if (group.trekDetails.genderPreference !== "any" && 
      group.trekDetails.genderPreference.toLowerCase() !== req.user.gender.toLowerCase()) {
    throw new ApiError(400, `This group prefers ${group.trekDetails.genderPreference} members only`);
  }

  // Check age range if applicable
  if (req.user.age && group.trekDetails.ageFrom && group.trekDetails.ageTo) {
    if (req.user.age < group.trekDetails.ageFrom || req.user.age > group.trekDetails.ageTo) {
      throw new ApiError(400, `This group is for people aged ${group.trekDetails.ageFrom}-${group.trekDetails.ageTo}`);
    }
  }

  // Add user to group
  const memberAdded = await group.addMember(req.user._id);
  
  if (!memberAdded) {
    throw new ApiError(500, "Failed to join group");
  }

  // Add group to user's joined groups
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { joinedGroups: group._id }
    }
  );

  // Create system message for user joining
  await Message.create({
    content: `${req.user.fullName} joined the group`,
    sender: req.user._id,
    group: group._id,
    isSystemMessage: true
  });

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Successfully joined the group"));
});

// Leave a group
export const leaveGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  
  if (!mongoose.isValidObjectId(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Group.findById(groupId);
  
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if user is a member
  const isMember = group.isUserMember(req.user._id);

  if (!isMember) {
    throw new ApiError(400, "You are not a member of this group");
  }

  // Check if user is the only admin
  const isOnlyAdmin = 
    group.isUserAdmin(req.user._id) && 
    group.members.filter(m => m.role === "admin").length === 1 &&
    group.members.length > 1;

  if (isOnlyAdmin) {
    throw new ApiError(400, "You're the only admin. Make someone else an admin before leaving");
  }

  // Remove user from group
  const memberRemoved = await group.removeMember(req.user._id);
  
  if (!memberRemoved) {
    throw new ApiError(500, "Failed to leave group");
  }

  // Remove group from user's joined groups
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { joinedGroups: group._id }
    }
  );

  // Create system message for user leaving
  await Message.create({
    content: `${req.user.fullName} left the group`,
    sender: req.user._id,
    group: group._id,
    isSystemMessage: true
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully left the group"));
});

// Update group details
export const updateGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const updates = req.body;
  
  if (!mongoose.isValidObjectId(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Group.findById(groupId);
  
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if user is admin
  if (!group.isUserAdmin(req.user._id)) {
    throw new ApiError(403, "Only group admins can update group details");
  }

  // Filter allowed update fields
  const allowedUpdates = [
    "name", "description", "isOpen", "groupImage", 
    "trekDetails.additionalMembers", "trekDetails.genderPreference",
    "trekDetails.ageFrom", "trekDetails.ageTo"
  ];
  
  const filteredUpdates = Object.entries(updates)
    .filter(([key]) => allowedUpdates.includes(key))
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  // Handle nested trekDetails updates
  if (updates.trekDetails) {
    for (const [key, value] of Object.entries(updates.trekDetails)) {
      const fullKey = `trekDetails.${key}`;
      if (allowedUpdates.includes(fullKey)) {
        if (!filteredUpdates.trekDetails) {
          filteredUpdates.trekDetails = {};
        }
        filteredUpdates.trekDetails[key] = value;
      }
    }
  }

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    filteredUpdates,
    { new: true, runValidators: true }
  ).populate("members.user", "fullName email profilePicture");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Group updated successfully"));
});

// Make user an admin
export const makeAdmin = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;
  
  if (!mongoose.isValidObjectId(groupId) || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid group ID or user ID");
  }

  const group = await Group.findById(groupId);
  
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if requester is admin
  if (!group.isUserAdmin(req.user._id)) {
    throw new ApiError(403, "Only group admins can promote members");
  }

  // Check if target user is a member
  const memberIndex = group.members.findIndex(
    member => member.user.toString() === userId
  );

  if (memberIndex === -1) {
    throw new ApiError(404, "User is not a member of this group");
  }

  // Already an admin
  if (group.members[memberIndex].role === "admin") {
    throw new ApiError(400, "User is already an admin");
  }

  // Make user an admin
  group.members[memberIndex].role = "admin";
  await group.save();

  // Get user details
  const promotedUser = await User.findById(userId, "fullName");

  // Create system message
  await Message.create({
    content: `${promotedUser.fullName} is now an admin`,
    sender: req.user._id,
    group: group._id,
    isSystemMessage: true
  });

  return res
    .status(200)
    .json(new ApiResponse(200, group, "User promoted to admin successfully"));
});

// Remove member from group
export const removeMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;
  
  if (!mongoose.isValidObjectId(groupId) || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid group ID or user ID");
  }

  const group = await Group.findById(groupId);
  
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if requester is admin
  if (!group.isUserAdmin(req.user._id)) {
    throw new ApiError(403, "Only group admins can remove members");
  }

  // Cannot remove yourself (use leave group endpoint instead)
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "Use the 'leave group' endpoint to remove yourself");
  }

  // Get user details before removal
  const targetUser = await User.findById(userId, "fullName");
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Check if target is also an admin
  const targetMember = group.members.find(
    member => member.user.toString() === userId
  );
  
  if (!targetMember) {
    throw new ApiError(404, "User is not a member of this group");
  }

  if (targetMember.role === "admin") {
    throw new ApiError(403, "Cannot remove another admin. They must leave voluntarily");
  }

  // Remove member
  const memberRemoved = await group.removeMember(userId);
  
  if (!memberRemoved) {
    throw new ApiError(500, "Failed to remove member");
  }

  // Update user's joined groups
  await User.findByIdAndUpdate(
    userId,
    {
      $pull: { joinedGroups: group._id }
    }
  );

  // Create system message
  await Message.create({
    content: `${targetUser.fullName} was removed from the group`,
    sender: req.user._id,
    group: group._id,
    isSystemMessage: true
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed successfully"));
});

// Get user's groups
export const getUserGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({
    "members.user": req.user._id
  })
    .sort({ lastActivity: -1 })
    .populate("createdBy", "fullName email profilePicture")
    .populate("members.user", "fullName email profilePicture");

  return res
    .status(200)
    .json(new ApiResponse(200, groups, "User groups retrieved successfully"));
});