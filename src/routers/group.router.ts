import { Router } from "express";
import { createGroup, createSubGroup, deleteGroup } from "../controllers/group.controller";
import authWare from "../middlewares/authWare";

const groupRouter = Router();

groupRouter.post("/create", authWare, createGroup);
groupRouter.post("/create-subgroup", authWare, createSubGroup);
groupRouter.delete("/delete", authWare, deleteGroup);

export default groupRouter;
