import { Router } from "express";
import { getRequestedUser, login, logout, validateToken } from "../controllers/auth.controller";
import authWare from "../middlewares/authWare";

const authRouter = Router();

authRouter.post("/refresh", validateToken);
authRouter.post("/login", login);
authRouter.post("/logout", authWare, logout);
authRouter.get("/me", authWare, getRequestedUser);

export default authRouter;
