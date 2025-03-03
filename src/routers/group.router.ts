import { Router } from "express";
import {
  createGroup,
  createGroupPosition,
  deleteGroup,
  getGroups,
  requestGroup,
  getAllGroupRoles,
  addUserGroupPosition,
} from "../controllers/group.controller";
import authWare from "../middlewares/authWare";

const groupRouter = Router();

// Public Endpoints
groupRouter.get("/public", requestGroup);

// Private Endpoints
groupRouter.get("/all", authWare, getGroups);
groupRouter.get("/roles", authWare, getAllGroupRoles);
groupRouter.post("/create", authWare, createGroup);
groupRouter.post("/create-position", authWare, createGroupPosition);
groupRouter.post("/assign-position", authWare, addUserGroupPosition);
groupRouter.delete("/delete", authWare, deleteGroup);

export default groupRouter;
