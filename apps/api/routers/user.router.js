import { Router } from 'express';
import { getUser, deleteUser, updateUser } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/get', getUser);
userRouter.post('/delete', deleteUser);
userRouter.post('/update', updateUser);

export default userRouter;
