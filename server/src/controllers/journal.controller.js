import JournalEntry from "../models/journalEntry.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

export const addJournalEntry = async (req, res) => {
  try {
    const { position, name, description } = req.body;
    const imageFile = req.file;
    
    if (!position || !name || !description || !imageFile) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    const uploadResponse = await uploadOnCloudinary(imageFile.path);
    
    if (!uploadResponse || !uploadResponse.secure_url) {
      return res.status(400).json({ 
        message: "Image upload failed" 
      });
    }
    
    // Add user reference to the journal entry
    const newEntry = new JournalEntry({
      position: JSON.parse(position),
      name,
      description,
      image: uploadResponse.secure_url,
      user: req.user._id, // From the auth middleware
    });

    await newEntry.save();
    res.status(201).json({ data: newEntry });
  } catch (error) {
    console.error("Error in addJournalEntry:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all entries (admin or system purpose)
export const getAllJournalEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find().sort({ createdAt: -1 });
    res.status(200).json({ data: entries });
  } catch (error) {
    console.error("Error in getAllJournalEntries:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user's journal entries
export const getUserJournalEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ data: entries });
  } catch (error) {
    console.error("Error in getUserJournalEntries:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get entries by specified user ID (admin function)
export const getEntriesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const entries = await JournalEntry.find({ user: userId })
      .sort({ createdAt: -1 });
    res.status(200).json({ data: entries });
  } catch (error) {
    console.error("Error in getEntriesByUserId:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get a specific journal entry by ID with ownership verification
export const getJournalEntryById = async (req, res) => {
  try {
    const entryId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ message: "Invalid entry ID format" });
    }
    
    const entry = await JournalEntry.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    
    // Verify ownership (skip if admin function needed)
    if (entry.user && entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "You don't have permission to access this entry" 
      });
    }
    
    res.status(200).json({ data: entry });
  } catch (error) {
    console.error("Error in getJournalEntryById:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update journal entry with ownership verification
export const updateJournalEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    const { position, name, description } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ message: "Invalid entry ID format" });
    }
    
    // Find entry to verify ownership
    const entry = await JournalEntry.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    
    // Verify ownership
    if (entry.user && entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "You don't have permission to update this entry" 
      });
    }
    
    // Prepare update data
    const updateData = {};
    if (position) updateData.position = JSON.parse(position);
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    
    // Handle image update if provided
    if (req.file) {
      const uploadResponse = await uploadOnCloudinary(req.file.path);
      if (uploadResponse && uploadResponse.secure_url) {
        updateData.image = uploadResponse.secure_url;
      }
    }
    
    // Update the entry
    const updatedEntry = await JournalEntry.findByIdAndUpdate(
      entryId, 
      updateData, 
      { new: true }
    );
    
    res.status(200).json({ data: updatedEntry });
  } catch (error) {
    console.error("Error in updateJournalEntry:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete entry with ownership verification
export const deleteJournalEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ message: "Invalid entry ID format" });
    }
    
    // Find entry to verify ownership
    const entry = await JournalEntry.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    
    // Verify ownership
    if (entry.user && entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "You don't have permission to delete this entry" 
      });
    }
    
    // Delete the entry
    await JournalEntry.findByIdAndDelete(entryId);
    res.status(200).json({ data: entry });
  } catch (error) {
    console.error("Error in deleteJournalEntry:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete multiple entries with ownership verification
export const deleteManyJournalEntries = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of entry IDs
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty array of IDs" });
    }
    
    // Filter valid IDs
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid IDs provided" });
    }
    
    // Find entries owned by the user
    const userEntries = await JournalEntry.find({
      _id: { $in: validIds },
      user: req.user._id
    });
    
    const userEntryIds = userEntries.map(entry => entry._id);
    
    if (userEntryIds.length === 0) {
      return res.status(404).json({ 
        message: "No entries found that you have permission to delete" 
      });
    }
    
    // Delete only the entries owned by the user
    const result = await JournalEntry.deleteMany({
      _id: { $in: userEntryIds }
    });
    
    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error in deleteManyJournalEntries:", error);
    res.status(500).json({ message: error.message });
  }
};