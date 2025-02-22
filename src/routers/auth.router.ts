import { Router } from "express";
import { login, register, getRequestedUser, validateToken, logout } from "../controllers/auth.controller";
import authWare from "../middlewares/authWare";

const authRouter = Router();

authRouter.post("/refresh", validateToken);
authRouter.post("/login", login);
authRouter.post("/logout", authWare, logout);
authRouter.post("/register", authWare, register);
authRouter.get("/me", authWare, getRequestedUser);

export default authRouter;
