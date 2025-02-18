import "dotenv/config";
const PORT = process.env.PORT!;

import cors from "cors";
import express, { Request, Response } from "express";

import authRouter from "./routers/auth.router";
import postRouter from "./routers/post.router";
import sponsorRouter from "./routers/sponsor.router";
import groupRouter from "./routers/group.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/sponsor", sponsorRouter);
app.use("/api/group", groupRouter);

app.get("/api", (req: Request, res: Response) => {
  res.json("OK!");
});

app.listen(PORT, () => console.log(`🚀 Server ready at: http://localhost:${PORT}`));
