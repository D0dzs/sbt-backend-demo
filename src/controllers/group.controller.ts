import prisma from "../../lib/db";

import { Request, Response } from "express";
import { userRole } from "../../lib/utils";
import AssignUserGroupFormSchema from "../schemas/AssignUserGroupForm";
import CreateGroupPositionSchema from "../schemas/CreateGroupPositionSchema";
import DeleteGroupSchema from "../schemas/DeleteGroupSchema";
import GroupSchema from "../schemas/GroupSchema";

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
  if ((await userRole(user)) !== "admin") return res.status(401).json({ message: "Unauthorized" });

  const groups = await prisma.group.findMany({ omit: { id: true, leaderID: true } });
  if (!groups) return res.status(404).json({ message: "Groups not found" });

  return res.status(200).json({ groups });
};

const getAllGroupRoles = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const roles = await prisma.groupPosition.findMany({
    omit: { groupID: true, id: true },
    include: {
      group: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!roles) return res.status(404).json({ message: "Group roles not found" });

  return res.status(200).json({ roles });
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

  try {
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
  } catch (error) {
    const target = (error as any).meta.target[0];
    if (target === "name") {
      return res.status(400).json({
        message: "This group position already exists, please change the name of the group to something else!",
      });
    }
  }

  return res.status(500).json({ message: "Internal server error" });
};

const addUserGroupPosition = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = AssignUserGroupFormSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const { username, rolename, groupname } = parsed.data;
  const [firstName, lastName] = username.split(" ");

  const cUserID = await prisma.user.findFirst({ where: { firstName, lastName }, select: { id: true } });
  if (!cUserID) return res.status(404).json({ message: "User not found" });

  const cRoleID = await prisma.groupPosition.findFirst({
    where: { name: rolename },
    select: { id: true },
  });
  if (!cRoleID) return res.status(404).json({ message: "Role not found" });

  const cGroupID = await prisma.group.findFirst({
    where: { name: groupname },
    select: { id: true },
  });
  if (!cGroupID) return res.status(404).json({ message: "Group not found" });

  try {
    const ctx = await prisma.groupRole.create({
      data: {
        userID: cUserID.id,
        groupID: cGroupID.id,
        positionID: cRoleID.id,
      },
    });

    if (!ctx) return res.status(400).json({ message: "Failed to assign user to the role" });

    return res.status(201).json({ message: "User successfully assigned to the role" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
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

export {
  addUserGroupPosition,
  createGroup,
  createGroupPosition,
  deleteGroup,
  getAllGroupRoles,
  getGroups,
  requestGroup,
};
