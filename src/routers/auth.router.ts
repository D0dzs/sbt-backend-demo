import { Router } from "express";
import { login, register, getRequestedUser, refresh } from "../controllers/auth.controller";
import authWare from "../middlewares/authWare";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", authWare, register);
authRouter.post("/refresh", refresh);
authRouter.get("/me", authWare, getRequestedUser);

export default authRouter;
