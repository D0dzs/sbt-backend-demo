import bcrypt from "bcrypt";

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../lib/db";
import { generateRefresh, generateToken } from "../../lib/utils";
import LoginSchema from "../schemas/LoginFormSchema";

const SALT = process.env.PASSWORD_SALT!;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

/**
 * Main Functions
 */

const login = async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.filter((error) => error.message !== "Required").map((error) => error.message);

    return res.status(400).json({ errors });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findFirst({ where: { email: email } });
  if (!user) return res.status(400).json({ message: "Helytelen jelszó vagy email!" });

  // Check if the user is suspended or not
  if (user.state) return res.status(403).json({ message: "Ez a fiók fel lett függesztve!" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const token = await generateToken(user.id);
    const refreshToken = await generateRefresh(user.id);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, parseInt(SALT));
    const tokenExist = await prisma.refreshToken.findFirst({ where: { userId: user.id } });
    if (tokenExist) await prisma.refreshToken.delete({ where: { id: tokenExist.id } });

    const recordRFTtoDb = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });

    if (!recordRFTtoDb) return res.status(500).json({ message: "Internal server error" });

    res.cookie("token", token, {
      secure: process.env.RAILWAY_ENVIRONMENT_NAME! === "production",
      httpOnly: false,
      path: "/",
      sameSite: process.env.RAILWAY_ENVIRONMENT_NAME! === "production" ? "strict" : "lax",
      // valid for 45 minutes (10 minutes for testing)
      maxAge: 45 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      secure: process.env.RAILWAY_ENVIRONMENT_NAME! === "production",
      httpOnly: true,
      sameSite: process.env.RAILWAY_ENVIRONMENT_NAME! === "production" ? "strict" : "lax",
      path: "/api/auth/refresh",
      // valid for 5 days
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ message: `Sikeres bejelentkezés mint: ${user.firstName} ${user.lastName}!`, redirect: "/" });
  }

  return res.status(401).json({ message: "Helytelen jelszó vagy email!" });
};

const getRequestedUser = async (req: Request, res: Response): Promise<any> => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const { id } = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string };

  const user = await prisma.user.findUnique({
    omit: { password: true },
    where: { id },
    include: { UserRole: { select: { role: { select: { name: true } } } }, Group: true },
  });

  if (!user) return res.status(404).json({ message: "Felhasználó nem található" });

  const simplifiedUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatarURL,
    createdAt: user.createdAt,
    role: user.UserRole.map((role: any) => role.role.name)[0],
    group: user.Group.map((group: any) => group.name)[0],
  };

  res.status(200).json({ user: simplifiedUser });
};

const validateToken = async (req: Request, res: Response): Promise<any> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string };
  const dbRefreshToken = await prisma.refreshToken.findUnique({
    where: { userId: id },
    select: { token: true, revoked: true },
  });

  if (!dbRefreshToken || dbRefreshToken.revoked) return res.status(401).json({ message: "Unauthorized" });

  const isMatch = await bcrypt.compare(refreshToken, dbRefreshToken.token);
  if (!isMatch) return res.status(401).json({ message: "Unauthorized" });

  if (isMatch) {
    try {
      const newAccessToken = await generateToken(id);
      const newRefreshToken = await generateRefresh(id);
      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, parseInt(SALT));

      const ctx = await prisma.refreshToken.upsert({
        where: { userId: id },
        update: {
          token: hashedRefreshToken,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        create: {
          token: hashedRefreshToken,
          userId: id,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      });

      if (!ctx) return res.status(500).json({ message: "Internal Server Error" });

      res.cookie("token", newAccessToken, {
        secure: process.env.RAILWAY_ENVIRONMENT_NAME! === "production",
        httpOnly: true,
        path: "/",
        sameSite: process.env.RAILWAY_ENVIRONMENT_NAME! === "production" ? "strict" : "lax",
        maxAge: 45 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        secure: process.env.RAILWAY_ENVIRONMENT_NAME! === "production",
        httpOnly: true,
        path: "/api/auth/refresh",
        sameSite: "strict",
        maxAge: 5 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(true);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // If the refresh token is not close to expiration, just return success
    return res.status(200).json(true);
  }
};

const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    res.clearCookie("token");
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

    return res.status(200).json({ message: "Sikeres kijelentkezés!", redirect: "/" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getRequestedUser, login, logout, validateToken };
