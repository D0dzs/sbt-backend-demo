import "dotenv/config";
const PORT = process.env.PORT!;

import cors from "cors";
import express, { Request, Response } from "express";

import authRouter from "./routers/auth.router";
import postRouter from "./routers/post.router";
import authWare from "./middlewares/authWare";
import { userRole } from "../lib/utils";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);

// app.get("/api/test", authWare, async (req: Request, res: Response) => {
//   const user = (req as any).user;
//   const role = await userRole(user);
//   if (role !== "admin") {
//     res.status(403).json({ message: "Forbidden" });
//   } else {
//     res.json("OK!");
//   }
// });

app.get("/api", (req: Request, res: Response) => {
  res.json("OK!");
});

app.listen(PORT, () => console.log(`🚀 Server ready at: http://localhost:${PORT}`));
