import { Router } from "express";
import { changePassword, changeState, getAllUsers, register, updateUserRole } from "../controllers/users.controller";
import authWare from "../middlewares/authWare";

const userRouter = Router();

userRouter.get("/all", authWare, getAllUsers);
userRouter.post("/register", authWare, register);
userRouter.post("/change-state", authWare, changeState);
userRouter.post("/change-password", authWare, changePassword);
userRouter.post("/change-role", authWare, updateUserRole);

export default userRouter;
