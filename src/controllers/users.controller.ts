import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../../lib/db";
import ChangePasswordSchema from "../schemas/ChangePasswordSchema";
import ChangeRoleSchema from "../schemas/ChangeRoleSchema";
import ChangeStateSchema from "../schemas/ChangeStateSchema";
import RegisterUserSchema from "../schemas/RegisterUserSchema";
import fs from "fs";
import { validateMIMEType } from "validate-image-type";
import path from "path";

const SALT = process.env.PASSWORD_SALT!;

const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  const { role } = (req as any).user;
  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      state: true,
      UserRole: { select: { role: { select: { name: true } } } },
    },
  });
  if (!users) return res.status(404).json({ message: "Nincs felhasználó regisztrálva" });

  const cleanUsers = users.map((user: any) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    state: user.state,
    role: user.UserRole.map((role: any) => role.role.name)[0] || null,
  }));

  res.status(200).json({ users: cleanUsers });
};

const register = async (req: Request, res: Response): Promise<any> => {
  const { role } = (req as any).user;
  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });
  if (!req.file) return res.status(400).json({ message: "Avatar is required!" });

  try {
    const body = req.body;
    const parsed = RegisterUserSchema.safeParse(body);
    if (!parsed.success) {
      fs.unlinkSync(req.file.path);
      const errors = parsed.error.errors.map((error) => error.message);
      return res.status(400).json({ errors });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
    const filePath = req.file.path;
    const result = await validateMIMEType(filePath, { allowMimeTypes: allowedMimeTypes });

    if (!result.ok) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Hibás fájl típus!" });
    }

    const filename = path.basename(filePath);
    const relativePath = `u/${filename}`;

    const { email, password, firstName, lastName, role } = parsed.data;
    const hashedPassword = await bcrypt.hash(password, parseInt(SALT));

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        avatarURL: req.file ? relativePath : null,
        UserRole: { create: { role: { connect: { name: role } } } },
      },
    });

    if (!user) return res.status(500).json({ message: "Sikertelen felhasználó létrehozás!" });

    res.status(201).json({ message: "Sikeres regisztráció!" });
  } catch (error) {
    res.status(500).json({ message: "A megadott email cím már foglalt!" });
  }
};

const changeState = async (req: Request, res: Response): Promise<any> => {
  const { role } = (req as any).user;
  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

  try {
    const body = req.body;
    const parsed = ChangeStateSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      return res.status(400).json({ errors });
    }

    const { firstName, lastName, id } = parsed.data;

    const targetUserID = await prisma.user.findFirst({
      where: { id, firstName, lastName },
      select: { state: true },
    });
    if (!targetUserID) return res.status(404).json({ message: "Felhasználó nem található!" });

    const user = await prisma.user.update({
      where: { id },
      data: { state: !targetUserID.state },
    });

    if (!user) return res.status(404).json({ message: "Felhasználó nem található!" });

    res.status(200).json({
      message: `Felhasználó állapota sikeresen módosítva a következőre: ${!user.state ? "Aktív" : "Inaktív"}!`,
    });
  } catch (error) {
    res.status(500).json({ message: "Sikertelen felfüggeszés!" });
  }
};

const changePassword = async (req: Request, res: Response): Promise<any> => {
  const { role } = (req as any).user;
  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

  try {
    const body = req.body;
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);

      return res.status(400).json({ errors });
    }
    const { id, password } = parsed.data;

    try {
      await prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { revoked: true },
      });
    } catch (error) {
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(SALT));
    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    if (!user) return res.status(404).json({ message: "Felhasználó nem található!" });

    res.status(200).json({ message: "A jelszó sikeresen frissítve lett!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sikertelen jelszó frissítés!" });
  }
};

const updateUserRole = async (req: Request, res: Response): Promise<any> => {
  const { role } = (req as any).user;
  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

  try {
    const body = req.body;
    const parsed = ChangeRoleSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);

      return res.status(400).json({ errors });
    }

    const { id, newRole } = parsed.data;

    const newRoleID = await prisma.role.findUnique({ where: { name: newRole }, select: { id: true } });
    if (!newRoleID) return res.status(404).json({ message: "Szerepkör nem található!" });

    const currentUserRole = await prisma.userRole.findFirst({
      where: { userID: id },
      include: { role: true },
    });

    if (currentUserRole?.role.name === "admin" && newRole !== "admin") {
      const adminCount = await prisma.userRole.count({
        where: { role: { name: "admin" } },
      });

      if (adminCount <= 2) {
        return res.status(400).json({
          message: "Sikertelen szerepfrissítés! (Minimum: 2 admin)",
        });
      }
    }

    const updateRole = await prisma.user.update({
      where: { id },
      data: {
        UserRole: {
          updateMany: {
            where: { userID: id },
            data: { roleID: newRoleID.id },
          },
        },
      },
    });
    if (!updateRole) return res.status(404).json({ message: "Felhasználó nem található!" });

    res.status(200).json({ message: `Felhasználó szerepe frissítve a következőre: ${newRole}!` });
  } catch (error) {
    res.status(500).json({ message: "Sikertelen szerep frissítés" });
  }
};

export { changePassword, changeState, getAllUsers, register, updateUserRole };
