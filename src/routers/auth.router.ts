import { Router } from "express";
import { login, register, getRequestedUser } from "../controllers/auth.controller";
import authWare from "../middlewares/authWare";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/me", authWare, getRequestedUser);

export default authRouter;
