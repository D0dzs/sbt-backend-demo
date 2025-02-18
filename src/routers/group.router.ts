import { Router } from "express";
import authWare from "../middlewares/authWare";
import { createGroup, createSubGroup, deleteGroup } from "../controllers/group.controller";

const groupRouter = Router();

groupRouter.post("/create", authWare, createGroup);
groupRouter.post("/create-subgroup", authWare, createSubGroup);
groupRouter.delete("/delete", authWare, deleteGroup);

export default groupRouter;
