import "dotenv/config";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../lib/db";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

const authWare = async (req: Request, res: Response, next: any) => {
  // If there is no authorization header
  const accessToken = req.cookies.token;
  if (!accessToken) return res.status(401).json({ message: "Unauthorized 1" });

  // Check for token
  if (!accessToken) return res.status(401).json({ message: "Unauthorized 2" });

  // Check if token is expired otherwise return unauthorized
  const exp = accessToken.split(".")[1];
  const dPaylod = JSON.parse(atob(exp));
  const expirationTime = dPaylod.exp * 1000;
  const expired = Date.now() > expirationTime;
  if (expired) return res.status(401).json({ message: "Unauthorized 3" });

  const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as { id: string };
  const id = decoded.id;

  const user = await prisma.user.findUnique({
    omit: { password: true },
    where: { id },
    include: { Post: true, Group: true, UserRole: { select: { role: { select: { name: true } } } } },
  });

  if (!user) return res.status(401).json({ message: "Unauthorized 4" });

  (req as any).user = user;
  return next();
};

export default authWare;
