import express from "express";
import multer from "multer";
import { 
  addJournalEntry, 
  getAllJournalEntries, 
  getUserJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry, 
  deleteManyJournalEntries,
  getEntriesByUserId
} from "../controllers/journal.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js"; 

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Apply authentication middleware to all journal routes
router.use(verifyJwt); // Ensures all journal operations require authentication

// Create entry (automatically associates with logged-in user)
router.post("/addentry", upload.single("image"), addJournalEntry);

// Get all entries (admin only route)
router.get("/getallentries", getAllJournalEntries);

// Get current user's entries
router.get("/getuserentries", getUserJournalEntries);

// Get entries for a specific user (for admin purposes)
router.get("/getentriesbyuser/:userId", getEntriesByUserId);

// Get a specific entry by ID (ensures user can only access their own entries)
router.get("/getentry/:id", getJournalEntryById);

// Update an entry
router.put("/updateentry/:id", upload.single("image"), updateJournalEntry);

// Delete routes
router.post("/deleteentry/:id", deleteJournalEntry);
router.post("/deleteentries", deleteManyJournalEntries);

export default router;