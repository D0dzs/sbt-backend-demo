import "dotenv/config";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../lib/db";

const JWT = process.env.JWT_KEY!;

const authWare = async (req: Request, res: Response, next: any) => {
  const auth: any = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, JWT) as { id: string };
  const id = decoded.id;

  const user = await prisma.user.findUnique({
    omit: { password: true },
    where: { id },
    include: { Post: true, Group: true, UserRole: true },
  });

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  (req as any).user = user;
  return next();
};

export default authWare;
