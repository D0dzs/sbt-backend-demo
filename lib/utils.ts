import "dotenv/config";
import { parse as parseCookie } from "cookie";
import prisma from "./db";

const extractToken = async (cookie: string): Promise<any> => {
  try {
    const token = parseCookie(cookie)["token"];
    if (!token) return undefined;

    return token;
  } catch (error) {
    return { message: "Failed to extract token" };
  }
};

const userRole = async (user: any): Promise<any> => {
  const role = user.UserRole[0].roleId;
  const ctx = await prisma.role.findUnique({
    where: {
      id: role,
    },
    select: {
      name: true,
    },
  });

  if (!ctx) return { message: "Failed to look up for role" };

  return ctx.name.toLowerCase().trim();
};

export { extractToken, userRole };
