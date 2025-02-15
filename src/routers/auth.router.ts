import { Router } from "express";
import { login, register, getRequestedUser, verifyToken } from "../controllers/auth.controller";
import authWare from "../middlewares/authWare";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/verify-token", authWare, verifyToken);
authRouter.get("/me", authWare, getRequestedUser);

export default authRouter;
