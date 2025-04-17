import mongoose, { Schema } from "mongoose";

const partSchema = new Schema({
    text: {
        type: String,
        required: true,
    }
})

const historySchema = new Schema({
    role: {
        type: String,
        enum: ["user", "model"],    
        required: true,
    },
    parts: {
    type: [partSchema],
    required: true,
    },
})
const chatSchema = new mongoose.Schema({
    history: {
      type: [historySchema],
      required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
  });
  
const Chat = mongoose.model("Chat", chatSchema);
  
export default Chat;
