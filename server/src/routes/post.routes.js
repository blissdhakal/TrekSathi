import express from 'express';
import { AddPost, DeletePost,  getPostsByTrekid, upvotePost, downvotePost } from '../controllers/PostController.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';


const router = express.Router();    

router.route("/addpost").post(upload.single('image'), verifyJwt, AddPost);
router.route("/deletepost/:id").post(DeletePost);
router.route("/getallpost").get(getPostsByTrekid);

router.post('/upvote/:postId', verifyJwt, upvotePost);
router.post('/downvote/:postId', verifyJwt, downvotePost);
export default router;