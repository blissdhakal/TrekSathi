import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trek: { type: mongoose.Schema.Types.ObjectId, ref: "Trek" },
  location: {
    type: String,
  },
  image: {
    publicId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  // Add upvotes and downvotes tracking
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

// Add a virtual for total vote count
postSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Ensure virtuals are included when converting to JSON/Objects
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model("Post", postSchema);

export default Post;