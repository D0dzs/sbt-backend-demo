import { Router } from "express";
import authWare from "../middlewares/authWare";
import {
  addUserSubGroupPosition,
  createSubGroup,
  createSubGroupPosition,
  getAllSubGroupRoles,
  getSubGroups,
  requestSubGroup,
} from "../controllers/subgroup.controller";

const subGroupRouter = Router();

// Public Endpoints
subGroupRouter.get("/public", requestSubGroup);

// Private Endpoints
subGroupRouter.get("/all", authWare, getSubGroups);
subGroupRouter.get("/roles", authWare, getAllSubGroupRoles);
subGroupRouter.post("/create", authWare, createSubGroup);
subGroupRouter.post("/create-position", authWare, createSubGroupPosition);
subGroupRouter.post("/assign-position", authWare, addUserSubGroupPosition);

export default subGroupRouter;
