import prisma from "../../lib/db";

import { Request, Response } from "express";
import { userRole } from "../../lib/utils";
import AssignUserGroupFormSchema from "../schemas/AssignUserGroupForm";
// import DeleteGroupSchema from "../schemas/DeleteGroupSchema";
import RemoveUserFromGroupSchema from "../schemas/RemoveUserFromGroupSchema";
import GroupSchema from "../schemas/GroupSchema";

const requestGroup = async (req: Request, res: Response): Promise<any> => {
  try {
    // First get all groups with their IDs
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        leaderID: true,
      },
    });

    if (!groups || groups.length === 0) {
      return res.status(404).json({ message: "Nincs elérhető csoport" });
    }

    // Process each group to get the complete data structure
    const processedGroups = await Promise.all(
      groups.map(async (group) => {
        // Get leader information
        const leader = await prisma.user.findUnique({
          where: { id: group.leaderID },
          select: {
            lastName: true,
            firstName: true,
            avatarURL: true,
            // Get roles for this leader in this specific group
            GroupRole: {
              where: { groupID: group.id },
              select: { position: true },
            },
          },
        });

        // Get all group roles for this group (excluding leader)
        const groupRoles = await prisma.groupRole.findMany({
          where: {
            groupID: group.id,
            NOT: { userID: group.leaderID },
          },
          select: {
            position: true,
            user: {
              select: {
                lastName: true,
                firstName: true,
                avatarURL: true,
              },
            },
          },
        });

        // Get all subgroups for this group
        const subGroups = await prisma.subGroup.findMany({
          where: { groupId: group.id },
          select: {
            id: true,
            name: true,
            description: true,
            leaderID: true,
          },
        });

        // Process each subgroup
        const processedSubGroups = await Promise.all(
          subGroups.map(async (subGroup) => {
            // Get subgroup leader information
            const subGroupLeader = await prisma.user.findUnique({
              where: { id: subGroup.leaderID },
              select: {
                lastName: true,
                firstName: true,
                avatarURL: true,
                // Get roles for this leader in this specific subgroup
                SubGroupRole: {
                  where: { subGroupID: subGroup.id },
                  select: { position: true },
                },
              },
            });

            // Get all subgroup roles (excluding leader)
            const subGroupRoles = await prisma.subGroupRole.findMany({
              where: {
                subGroupID: subGroup.id,
                NOT: { userId: subGroup.leaderID },
              },
              select: {
                position: true,
                User: {
                  select: {
                    lastName: true,
                    firstName: true,
                    avatarURL: true,
                  },
                },
              },
            });

            return {
              name: subGroup.name,
              description: subGroup.description,
              leader: {
                lastName: subGroupLeader?.lastName,
                firstName: subGroupLeader?.firstName,
                avatarURL: subGroupLeader?.avatarURL || null,
                SubGroupRole: subGroupLeader?.SubGroupRole.length ? subGroupLeader.SubGroupRole : null,
              },
              SubGroupRole: subGroupRoles.length ? subGroupRoles : null,
            };
          }),
        );

        // Helper function to convert empty arrays or strings to null
        const nullifyEmpty = (value: any) => {
          if (value === "") return null;
          if (Array.isArray(value) && value.length === 0) return null;
          return value;
        };

        return {
          name: group.name,
          description: group.description,
          leader: {
            lastName: leader?.lastName,
            firstName: leader?.firstName,
            avatarURL: leader?.avatarURL || null,
            GroupRole: leader?.GroupRole.length ? leader.GroupRole : null,
          },
          GroupRole: groupRoles.length ? groupRoles : null,
          SubGroup: processedSubGroups.length ? processedSubGroups : null,
        };
      }),
    );

    return res.status(200).json({ groups: processedGroups });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getGroups = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") return res.status(401).json({ message: "Unauthorized" });

  const groups = await prisma.group.findMany({ omit: { id: true, leaderID: true } });
  if (!groups) return res.status(404).json({ message: "Nincs elérhető csoport!" });

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

  const { name, description, firstName, lastName } = parsed.data;

  const leaderId = await prisma.user.findFirst({
    where: { AND: [{ firstName }, { lastName }] },
    select: {
      id: true,
    },
  });

  if (!leaderId) return res.status(403).json({ message: "Felhasználó nem található!" });

  try {
    const ctx = await prisma.group.create({
      data: {
        name: name,
        description: description ?? "",
        leaderID: leaderId.id,
      },
    });
    if (!ctx) return res.status(400).json({ message: "Sikertelen csoport létrehozása!" });
    return res.status(200).json({ message: `Sikeresen létre lett hozva a(z) ${name} csoport!` });
  } catch (error) {
    const target = (error as any).meta.target[0];
    if (target === "name") {
      return res.status(400).json({ message: `Ez a csoport már létezik, kérjük, változtassa meg a csoport nevét!` });
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

  const { id, rolename, groupname } = parsed.data;

  const cGroupID = await prisma.group.findFirst({
    where: { name: groupname },
    select: { id: true },
  });
  if (!cGroupID) return res.status(404).json({ message: "Csoport nem található!" });

  try {
    const ctx = await prisma.groupRole.create({
      data: {
        userID: id,
        groupID: cGroupID.id,
        position: rolename,
      },
    });

    if (!ctx) return res.status(400).json({ message: "Sikertelen szerepkör hozzárendelés!" });

    return res.status(201).json({ message: "Sikeres szerepkör hozzárendelés!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ez a felhasználó már rendelkezik ezzel a szerepkörrel ebben a csoportban!" });
  }
};

const removeUserFromGroup = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  if ((await userRole(user)) !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsed = RemoveUserFromGroupSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const { firstName, lastName, group, isItSubGroup } = parsed.data;
  if (isItSubGroup) {
    try {
      const cUserID = await prisma.user.findFirst({
        where: { AND: [{ firstName: firstName }, { lastName: lastName }] },
        select: { id: true },
      });
      if (!cUserID) return res.status(404).json({ message: "Felhasználó nem található!" });

      const cGroupID = await prisma.subGroup.findFirst({
        where: { name: group },
        select: { id: true },
      });
      if (!cGroupID) return res.status(404).json({ message: "Alcsoport nem található!" });

      const response = await prisma.subGroupRole.delete({
        where: {
          userId_subGroupID: {
            userId: cUserID.id,
            subGroupID: cGroupID.id,
          },
        },
      });

      if (!response) return res.status(404).json({ message: "Sikertelen törlés!" });
      return res.status(200).json({ message: `${firstName} ${lastName} törölve lett ${group} csoportból!` });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    try {
      const cUserID = await prisma.user.findFirst({
        where: { AND: [{ firstName: firstName }, { lastName: lastName }] },
        select: { id: true },
      });
      if (!cUserID) return res.status(404).json({ message: "Felhasználó nem található" });

      const cGroupID = await prisma.group.findFirst({
        where: { name: group },
        select: { id: true },
      });
      if (!cGroupID) return res.status(404).json({ message: "Csoport nem található" });

      const response = await prisma.groupRole.delete({
        where: {
          userID_groupID: {
            userID: cUserID.id,
            groupID: cGroupID.id,
          },
        },
      });

      if (!response) return res.status(404).json({ message: "Sikertelen törlés!" });
      return res.status(200).json({ message: `${firstName} ${lastName} törölve lett ${group} csoportból!` });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

// const deleteGroup = async (req: Request, res: Response): Promise<any> => {
//   const user = (req as any).user;
//   if ((await userRole(user)) !== "admin") {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const body = req.body;
//   const parsed = DeleteGroupSchema.safeParse(body);
//   if (!parsed.success) {
//     const errors = parsed.error.errors.map((error) => error.message);
//     return res.status(400).json({ errors });
//   }

//   const { name } = parsed.data;
//   const ctx = await prisma.group.delete({ where: { name }});

//   if (!ctx) return res.status(400).json({ message: "Failed to delete group" });
//   return res.status(200).json({ message: `${ctx.name} deleted succesfully! (All sub-groups were deleted too!)` });
// };

// export { addUserGroupPosition, createGroup, deleteGroup, getGroups, requestGroup };
export { addUserGroupPosition, createGroup, getGroups, requestGroup, removeUserFromGroup };
