import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { withOptimize } from "@prisma/extension-optimize";

const prisma = new PrismaClient().$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY! }));

export const getCategoryByName = async (name: string) => {
  const category = await prisma.sponsorGroup.findUnique({
    where: { name },
  });

  if (!category) {
    throw new Error(`Category not found: ${name}`);
  }

  return category.id;
};

export default prisma;
