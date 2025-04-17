import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Message sender is required"]
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Message group is required"]
    },
    readBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    attachments: [{
      fileUrl: String,
      fileType: {
        type: String,
        enum: ["image", "document", "video", "audio", "other"],
      },
      fileName: String,
      fileSize: Number
    }],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message"
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for quick retrieval of messages in a group
MessageSchema.index({ group: 1, createdAt: -1 });

// Update group lastActivity when a new message is created
MessageSchema.post('save', async function(doc) {
  try {
    const Group = mongoose.model('Group');
    await Group.findByIdAndUpdate(doc.group, { lastActivity: Date.now() });
  } catch (error) {
    console.error('Error updating group lastActivity:', error);
  }
});

const Message = mongoose.model("Message", MessageSchema);
export default Message;