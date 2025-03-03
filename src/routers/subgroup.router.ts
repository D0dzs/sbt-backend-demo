import { Router } from "express";
import authWare from "../middlewares/authWare";
import { addUserSubGroupPosition, createSubGroup, getSubGroups } from "../controllers/subgroup.controller";

const subGroupRouter = Router();

// Private Endpoints
subGroupRouter.get("/all", authWare, getSubGroups);
subGroupRouter.post("/create", authWare, createSubGroup);
subGroupRouter.post("/assign-position", authWare, addUserSubGroupPosition);

export default subGroupRouter;
