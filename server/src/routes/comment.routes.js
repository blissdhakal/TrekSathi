import express from 'express';
import { AddComment, deleteComment, getAllComment, upvoteComment, downvoteComment } from '../controllers/CommentController.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.route('/addcomment').post(verifyJwt, AddComment);
router.route('/getcomment/:id').get(getAllComment);
router.route('/deletecomment/:id').post(deleteComment);
router.route('/upvote/:id').post(verifyJwt, upvoteComment); // Removed '/comment' prefix
router.route('/downvote/:id').post(verifyJwt, downvoteComment); // Removed '/comment' prefix

export default router;