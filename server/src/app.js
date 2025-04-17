import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//routes
import userRotuer from "./routes/user.routes.js"
import profileRouter from "./routes/profile.routes.js"
import postRoute from './routes/post.routes.js'
import CommentRoute from './routes/comment.routes.js'
import trekRoute from './routes/trek.routes.js'
import journalRouter from './routes/journal.routes.js'
import groupRouter from './routes/groupRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import itineraryRoutes from './routes/itinerary.routes.js';

app.use("/api/v1/user", userRotuer);
app.use("/api/v1/profile", profileRouter);
app.use('/api/v1/comment', CommentRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/trek', trekRoute);
app.use("/api/v1/journal", journalRouter);
app.use('/api/v1/groups', groupRouter);
app.use("/api/v1", messageRoutes);
app.use("/api/v1/itinerary", itineraryRoutes);

export { app };
