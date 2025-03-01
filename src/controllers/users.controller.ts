import bcrypt from "bcrypt";
import "dotenv/config";
import { Request, Response } from "express";
import prisma from "../../lib/db";
import ChangePasswordSchema from "../schemas/ChangePasswordSchema";
import ChangeRoleSchema from "../schemas/ChangeRoleSchema";
import ChangeStateSchema from "../schemas/ChangeStateSchema";
import RegisterUserSchema from "../schemas/RegisterUserSchema";

const SALT = process.env.PASSWORD_SALT!;

const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  const { role } = (req as any).user;
  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const users = await prisma.user.findMany({
    select: {
      firstName: true,
      lastName: true,
      state: true,
      UserRole: { select: { role: { select: { name: true } } } },
    },
  });

  const cleanUsers = users.map((user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    state: user.state,
    role: user.UserRole.map((role) => role.role.name)[0] || null,
  }));

  res.status(200).json({ users: cleanUsers });
};

const register = async (req: Request, res: Response): Promise<any> => {
  const { role } = (req as any).user;
  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const body = req.body;
  const parsed = RegisterUserSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);

    return res.status(400).json({ errors });
  }

  try {
    const { email, password, firstName, lastName, role } = parsed.data;
    const hashedPassword = await bcrypt.hash(password, parseInt(SALT));

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        UserRole: {
          create: {
            role: {
              connect: {
                name: role,
              },
            },
          },
        },
      },
    });

    if (!user) return res.status(500).json({ message: "Failed to create user" });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user" });
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

    const { email, state } = parsed.data;

    const user = await prisma.user.update({
      where: { email },
      data: { state: !state },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User state changed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change user state" });
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
    const { email, password } = parsed.data;

    const targetUserID = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!targetUserID) return res.status(404).json({ message: "User not found" });

    try {
      await prisma.refreshToken.updateMany({
        where: { userId: targetUserID.id },
        data: { revoked: true },
      });
    } catch (error) {
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(SALT));
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    if (!user) return res.status(404).json({ message: "User not found!" });

    res.status(200).json({ message: "User password changed successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user password" });
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

    const { email, newRole } = parsed.data;

    const targetUserID = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!targetUserID) return res.status(404).json({ message: "User not found" });

    const newRoleID = await prisma.role.findUnique({ where: { name: newRole }, select: { id: true } });
    if (!newRoleID) return res.status(404).json({ message: "Role not found" });

    const currentUserRole = await prisma.userRole.findFirst({
      where: { userID: targetUserID.id },
      include: { role: true },
    });

    if (currentUserRole?.role.name === "admin" && newRole !== "admin") {
      const adminCount = await prisma.userRole.count({
        where: {
          role: {
            name: "admin",
          },
        },
      });

      if (adminCount <= 2) {
        return res.status(400).json({
          message: "Cannot change role. At least two admins must remain in the system.",
        });
      }
    }

    const updateRole = await prisma.user.update({
      where: { id: targetUserID.id },
      data: {
        UserRole: {
          updateMany: {
            where: { userID: targetUserID.id },
            data: {
              roleID: newRoleID.id,
            },
          },
        },
      },
    });
    if (!updateRole) return res.status(404).json({ message: "User not found!" });

    res.status(200).json({ message: "User role updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role" });
  }
};

export { changePassword, changeState, getAllUsers, register, updateUserRole };
