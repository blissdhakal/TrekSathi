// journalEntry.model.js
import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema({
  position: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && 
               v[0] >= -90 && v[0] <= 90 &&
               v[1] >= -180 && v[1] <= 180;
      },
      message: props => `Invalid position coordinates: ${props.value}`
    }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [2000, "Description cannot exceed 2000 characters"]
  },
  image: {
    type: String,
    required: [true, "Image URL is required"],
    validate: {
      validator: v => {
        try {
          new URL(v);
          return true;
        } catch (err) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid URL`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);

export default JournalEntry;