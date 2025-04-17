import mongoose, { Schema } from "mongoose";

const GroupSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true
    },
    trekRoute: {
      type: String,
      required: [true, "Trek route is required"]
    },
    description: {
      type: String,
      default: ""
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Group creator is required"]
    },
    members: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member"
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    trekDetails: {
      startDate: {
        type: Date,
        required: [true, "Start date is required"]
      },
      endDate: {
        type: Date,
        required: [true, "End date is required"]
      },
      groupSize: {
        type: Number,
        required: [true, "Group size is required"]
      },
      additionalMembers: {
        type: Number,
        default: 0
      },
      genderPreference: {
        type: String,
        enum: ["any", "male", "female", "others"],
        default: "any"
      },
      ageFrom: {
        type: Number
      },
      ageTo: {
        type: Number
      }
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    groupImage: {
      type: String,
      default: "default-group.jpg"
    },
    pinned: [{
      type: Schema.Types.ObjectId,
      ref: "Message"
    }],
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property to get member count
GroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual property to check if group is full
GroupSchema.virtual('isFull').get(function() {
  return this.members.length >= (this.trekDetails.groupSize + this.trekDetails.additionalMembers);
});

// Virtual to get all messages in the group
GroupSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'group'
});

// Add the creator as the first member and admin when creating a group
GroupSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.members.push({
      user: this.createdBy,
      role: 'admin',
      joinedAt: new Date()
    });
  }
  next();
});

// Methods to manage members
GroupSchema.methods.addMember = async function(userId) {
  // Check if user is already a member
  const isMember = this.members.some(member => member.user.toString() === userId.toString());
  
  if (!isMember && !this.isFull) {
    this.members.push({
      user: userId,
      role: 'member',
      joinedAt: new Date()
    });
    this.lastActivity = new Date();
    await this.save();
    return true;
  }
  return false;
};

GroupSchema.methods.removeMember = async function(userId) {
  const initialCount = this.members.length;
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
  
  if (initialCount > this.members.length) {
    this.lastActivity = new Date();
    await this.save();
    return true;
  }
  return false;
};

GroupSchema.methods.isUserMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

GroupSchema.methods.isUserAdmin = function(userId) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member && member.role === 'admin';
};

const Group = mongoose.model("Group", GroupSchema);
export default Group;