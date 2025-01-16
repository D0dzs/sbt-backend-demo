import { Router } from 'express';
import { getUser, deleteUser, updateUser } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/getuser', getUser);
userRouter.post('/deleteUser', deleteUser);
userRouter.post('/updateUser', updateUser);

export default userRouter;
