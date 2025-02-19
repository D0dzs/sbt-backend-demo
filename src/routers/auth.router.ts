import { Router } from "express";
import { login, register, getRequestedUser, refresh } from "../controllers/auth.controller";
import authWare from "../middlewares/authWare";

const authRouter = Router();

// This handles user model, authentication, and authorization
authRouter.post("/refresh", refresh);
authRouter.post("/login", login);
authRouter.post("/register", authWare, register);
authRouter.get("/me", authWare, getRequestedUser);

export default authRouter;
