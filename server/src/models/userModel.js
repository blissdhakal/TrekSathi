import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"]
    },
    // New fields for groups
    joinedGroups: [{
      type: Schema.Types.ObjectId,
      ref: "Group"
    }],
    age: {
      type: Number,
    },
    profilePicture: {
      type: String,
      default: "default-profile.jpg"
    },
    trekExperience: {
      type: String,
      enum: ["beginner", "intermediate", "experienced", "expert"],
      default: "beginner"
    },
    interests: [{
      type: String
    }]
  },
  {
    timestamps: true,
  }
);

// hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// checking password
UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// refresh Token
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Method to join a group
UserSchema.methods.joinGroup = async function(groupId) {
  if (!this.joinedGroups.includes(groupId)) {
    this.joinedGroups.push(groupId);
    await this.save();
    return true;
  }
  return false; // Already in the group
};

// Method to leave a group
UserSchema.methods.leaveGroup = async function(groupId) {
  if (this.joinedGroups.includes(groupId)) {
    this.joinedGroups = this.joinedGroups.filter(id => id.toString() !== groupId.toString());
    await this.save();
    return true;
  }
  return false; // Not in the group
};

const User = mongoose.model("User", UserSchema);
export default User;