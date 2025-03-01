import { Router } from "express";
import {
  createGroup,
  createGroupPosition,
  createSubGroup,
  createSubGroupPosition,
  deleteGroup,
  getGroups,
  getSubGroups,
  requestGroup,
} from "../controllers/group.controller";
import authWare from "../middlewares/authWare";

const groupRouter = Router();

// Public Endpoints
groupRouter.get("/public", requestGroup);

// Private Endpoints
groupRouter.get("/all", authWare, getGroups);
groupRouter.get("/all-subgroup", authWare, getSubGroups);
groupRouter.post("/create", authWare, createGroup);
groupRouter.post("/create-position", authWare, createGroupPosition);
groupRouter.post("/create-subgroup", authWare, createSubGroup);
groupRouter.post("/create-subgroup-position", authWare, createSubGroupPosition);
groupRouter.delete("/delete", authWare, deleteGroup);

export default groupRouter;
