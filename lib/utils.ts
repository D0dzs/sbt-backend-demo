import "dotenv/config";
import prisma from "./db";
import jwt from "jsonwebtoken";

const userRole = async (user: any): Promise<any> => {
  return user.UserRole[0].role.name.toLowerCase();
};

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const generateToken = async (id: string): Promise<string> => {
  const accessToken = jwt.sign({ id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "45min",
  });
  return accessToken;
};

const generateRefresh = async (id: string): Promise<string> => {
  const refreshToken = jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "5d",
  });
  return refreshToken;
};

export { userRole, generateToken, generateRefresh };
