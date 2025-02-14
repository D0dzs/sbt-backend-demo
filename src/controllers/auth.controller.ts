import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";

import { Request, Response } from "express";
import prisma from "../../lib/db";
import { LoginSchema } from "../schemas/LoginFormSchema";
import { User } from "../schemas/UserSchema";

const SALT = process.env.PASSWORD_SALT!;
const JWT = process.env.JWT_KEY!;

const generateToken = (id: string) => {
  return jwt.sign({ id }, JWT, { expiresIn: "45min" });
};

const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, parseInt(SALT));
  return hash;
};

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

  const { email, password } = body;

  const user = await prisma.user.findFirst({ where: { email: email } });
  if (!user) return res.status(401).json({ message: "Failed to fetch the user" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const token = generateToken(user.id);
    return res.status(200).json({ message: "Succesfully logged in!", token });
  }

  return res.status(400).json({ message: "Invalid email or password!" });
};

const register = async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const parsed = User.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.filter((error) => error.message !== "Required").map((error) => error.message);

    return res.status(400).json({ errors });
  }

  const { email, password, firstName, lastName } = parsed.data;

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Failed to create user" });
  }

  res.status(200).json({ message: "User created successfully" });
};

const getRequestedUser = async (req: Request, res: Response): Promise<any> => {
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      UserRole: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    where: { id: (req as any).user.id },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
};

export { login, register, getRequestedUser };
