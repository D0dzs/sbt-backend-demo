import prisma from "../../lib/db";

import { Request, Response } from "express";
import { userRole } from "../../lib/utils";
import CreateGroupPositionSchema from "../schemas/CreateGroupPositionSchema";
import DeleteGroupSchema from "../schemas/DeleteGroupSchema";
import GroupSchema from "../schemas/GroupSchema";
import SubGroupSchema from "../schemas/SubGroupSchema";
import CreateSubGroupPositionSchema from "../schemas/CreateSubGroupPositionSchema";

const requestGroup = async (req: Request, res: Response): Promise<any> => {
  const groups = await prisma.group.findMany({
    omit: { id: true, leaderID: true },
    include: { SubGroup: { omit: { groupId: true, id: true } } },
  });
  if (!groups) return res.status(404).json({ message: "Groups not found" });

  return res.status(200).json({ groups });
};

const getGroups = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const groups = await prisma.group.findMany({ omit: { id: true, leaderID: true } });
  if (!groups) return res.status(404).json({ message: "Groups not found" });

  return res.status(200).json({ groups });
};

const getSubGroups = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const groups = await prisma.subGroup.findMany({ omit: { id: true, leaderID: true } });
  if (!groups) return res.status(404).json({ message: "Sub-groups not found" });

  return res.status(200).json({ groups });
};

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
    where: { AND: [{ firstName: firstName }, { lastName: lastName }] },
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
        leaderID: leaderId.id,
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

const createGroupPosition = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = CreateGroupPositionSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const { groupName, roleName } = parsed.data;
  const groupID = await prisma.group.findUnique({
    where: {
      name: groupName,
    },
  });
  if (!groupID) return res.status(404).json({ message: "Group not found" });

  const response = await prisma.groupPosition.create({
    data: {
      name: roleName,
      group: {
        connect: {
          id: groupID.id,
        },
      },
    },
  });
  if (!response) return res.status(500).json({ message: "Internal server error" });

  return res.status(200).json({ message: "Group position created succesfully!" });
};

const addUserGroupPosition = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = null;
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
        description: description,
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

const createSubGroupPosition = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = CreateSubGroupPositionSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const { name, subGroupName } = parsed.data;
  const subgroupID = await prisma.subGroup.findUnique({
    where: { name: subGroupName },
  });
  if (!subgroupID) return res.status(400).json({ message: "Sub-group not found" });
  const position = await prisma.subGroupPosition.create({
    data: {
      name,
      subGroup: {
        connect: {
          id: subgroupID.id,
        },
      },
    },
  });
  if (!position) return res.status(500).json({ message: "Internal server error" });

  return res.status(200).json({ message: "Sub-group position created succesfully!", position });
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

// TODO: Implement assigning users to group / sub-group positions

export {
  addUserGroupPosition,
  createGroup,
  createGroupPosition,
  createSubGroup,
  deleteGroup,
  getGroups,
  requestGroup,
  createSubGroupPosition,
  getSubGroups,
};
