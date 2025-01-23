import { Router } from 'express';
import { getGroup, deleteGroup, updateGroup, createGroup } from '../controllers/group.controller.js';

const groupRouter = Router();

groupRouter.get('/get', getGroup);
groupRouter.post('/delete', deleteGroup);
groupRouter.post('/update', updateGroup);
groupRouter.post('/create', createGroup);

export default groupRouter;
