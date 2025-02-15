import "dotenv/config";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../lib/db";

const JWT = process.env.JWT_KEY!;

const authWare = async (req: Request, res: Response, next: any) => {
  // If there is no authorization header
  const auth: any = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  // Check for token
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  // Check if token is expired otherwise return unauthorized
  const exp = token.split(".")[1];
  const dPaylod = JSON.parse(atob(exp));
  const expirationTime = dPaylod.exp * 1000;
  const expired = Date.now() > expirationTime;
  if (expired) return res.status(401).json({ message: "Unauthorized" });

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
