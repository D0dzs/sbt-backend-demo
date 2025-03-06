import { Router } from "express";
import { changePassword, changeState, getAllUsers, register, updateUserRole } from "../controllers/users.controller";
import authWare from "../middlewares/authWare";
import multer from "multer";
import { generateUID } from "../../lib/utils";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "/images/users/");
  },
  filename: async (_req, _file, cb) => {
    cb(null, await generateUID());
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const userRouter = Router();

userRouter.get("/all", authWare, getAllUsers);
userRouter.post("/register", authWare, upload.single("avatar"), register);
userRouter.post("/change-state", authWare, changeState);
userRouter.post("/change-password", authWare, changePassword);
userRouter.post("/change-role", authWare, updateUserRole);

export default userRouter;
