import mongoose, { Schema } from "mongoose";

const UserProfileSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    profilePicture: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    contactInfo: {
      phone: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
    },
    liveLocation: {
      type: String,
    },
    // New fields
    age: {
      type: Number,
      min: 16,
      max: 120
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    bio: {
      type: String,
      maxlength: 500
    },
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String
    },
    pastTreks: [String],
    trekExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    }
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);

export default UserProfile;