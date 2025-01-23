import { Router } from 'express';
import { createPost, updatePost, deletePost, getPost } from '../controllers/post.controller.js';

const postRouter = Router();

postRouter.get('/get', getPost);
postRouter.post('/create', createPost);
postRouter.post('/delete', deletePost);
postRouter.post('/update', updatePost);

export default postRouter;