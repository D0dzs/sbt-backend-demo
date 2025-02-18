import prisma from "../../lib/db";

import { Request, Response } from "express";
import GroupSchema from "../schemas/GroupSchema";
import { userRole } from "../../lib/utils";
import SubGroupSchema from "../schemas/SubGroupSchema";
import DeleteGroupSchema from "../schemas/DeleteGroupSchema";

const createGroup = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = GroupSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const { name, description, leaderName } = parsed.data;
  const [firstName, lastName] = leaderName.split(" ");

  const leaderId = await prisma.user.findFirst({
    where: {
      AND: [
        {
          firstName: firstName,
        },
        {
          lastName: lastName,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!leaderId) return res.status(403).json({ message: "Failed to fetch the ID" });

  try {
    const ctx = await prisma.group.create({
      data: {
        name: name,
        description: description,
        leaderId: leaderId.id,
      },
    });
    if (!ctx) return res.status(400).json({ message: "Failed to create sponsorgroup" });
    return res.status(200).json({ message: "Sponsorgroup created succesfully!" });
  } catch (error) {
    const target = (error as any).meta.target[0];
    if (target === "name") {
      return res
        .status(400)
        .json({ message: "This group already exists, please change the name of the group to something else!" });
    }
  }
  return res.status(500).json({ message: "Internal server error" });
};

const createSubGroup = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = SubGroupSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const { name, groupName } = parsed.data;
  const group = await prisma.group.findFirst({ where: { name: groupName }, select: { id: true } });
  if (!group) return res.status(400).json({ message: "Failed to fetch group" });
  const groupId = group.id;

  try {
    const ctx = await prisma.subGroup.create({
      data: {
        name: name,
        groupId: groupId,
      },
    });

    if (!ctx) return res.status(400).json({ message: "Failed to create sub-group" });
    return res.status(200).json({ message: "Sub-group created succesfully!" });
  } catch (error) {
    const target = (error as any).meta.target[0];
    if (target === "name") {
      return res
        .status(400)
        .json({ message: "This sub-group already exists, please change the name of the sub-group to something else!" });
    }
  }

  return res.status(500).json({ message: "Internal server error" });
};

const deleteGroup = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = DeleteGroupSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const { id } = parsed.data;
  const ctx = await prisma.group.delete({ where: { id: id }, select: { name: true } });

  if (!ctx) return res.status(400).json({ message: "Failed to delete group" });
  return res.status(200).json({ message: `${ctx.name} deleted succesfully! (All sub-groups were deleted too!)` });
};

export { createGroup, createSubGroup, deleteGroup };
