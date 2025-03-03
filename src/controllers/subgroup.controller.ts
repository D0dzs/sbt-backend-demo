import prisma from "../../lib/db";

import { Request, Response } from "express";
import { userRole } from "../../lib/utils";
import AssignUserSubGroupFormSchema from "../schemas/AssignUserSubGroupFormSchema";
import SubGroupSchema from "../schemas/SubGroupSchema";

const getSubGroups = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") return res.status(401).json({ message: "Unauthorized" });

  const groups = await prisma.subGroup.findMany({ omit: { id: true, leaderID: true } });
  if (!groups) return res.status(404).json({ message: "Sub-groups not found" });

  return res.status(200).json({ groups });
};

const addUserSubGroupPosition = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = AssignUserSubGroupFormSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const { username, rolename, subgroupname } = parsed.data;
  const [firstName, lastName] = username.split(" ");

  const cUserID = await prisma.user.findFirst({ where: { firstName, lastName }, select: { id: true } });
  if (!cUserID) return res.status(404).json({ message: "User not found" });

  const cSubGroupID = await prisma.subGroup.findFirst({
    where: { name: subgroupname },
    select: { id: true },
  });
  if (!cSubGroupID) return res.status(404).json({ message: "SubGroup not found" });

  try {
    const ctx = await prisma.subGroupRole.create({
      data: {
        userId: cUserID.id,
        subGroupID: cSubGroupID.id,
        position: rolename,
      },
    });

    if (!ctx) return res.status(400).json({ message: "Failed to assign user to the role" });

    return res.status(201).json({ message: "User successfully assigned to the role" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
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

  const { name, description, leaderName, groupName } = parsed.data;
  const [firstName, lastName] = leaderName.split(" ");
  const group = await prisma.group.findFirst({ where: { name: groupName }, select: { id: true } });
  if (!group) return res.status(400).json({ message: "Failed to fetch group" });

  const leader = await prisma.user.findFirst({
    where: { AND: [{ firstName: firstName }, { lastName: lastName }] },
    select: { id: true },
  });
  if (!leader) return res.status(400).json({ message: "Failed to fetch leader" });

  try {
    const ctx = await prisma.subGroup.create({
      data: {
        name: name,
        description: description ?? "",
        Group: {
          connect: {
            id: group.id,
          },
        },
        leader: {
          connect: {
            id: leader.id,
          },
        },
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

export { createSubGroup, addUserSubGroupPosition, getSubGroups };
