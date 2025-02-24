import "dotenv/config";

import prisma from "../lib/db";
import bcrypt from "bcrypt";

const SALT = parseInt(process.env.SALT!);

async function main() {
  // Insert roles
  const roles = ["admin", "writer"];
  for (const role of roles) {
    const roleExist = await prisma.role.findUnique({ where: { name: role } });
    if (roleExist) continue;

    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });

    console.log(`Role "${role}" seeded successfully`);
  }

  const sponsorGroups = ["gigawatt", "megawatt", "kilowatt", "bme", "science"];
  for (const group of sponsorGroups) {
    const groupExist = await prisma.sponsorGroup.findUnique({ where: { name: group } });
    if (groupExist) continue;

    await prisma.sponsorGroup.upsert({
      where: { name: group },
      update: {},
      create: { name: group },
    });

    console.log(`Sponsor group "${group}" seeded successfully`);
  }

  // Fetch the ADMIN and WRITER role IDs
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" }, select: { id: true } });
  const writerRole = await prisma.role.findUnique({ where: { name: "WRITER" }, select: { id: true } });

  if (!adminRole || !writerRole) throw new Error("ADMIN or WRITER role not found");

  // Check if admin user already exists
  const adminUserExists = await prisma.user.findUnique({ where: { email: "admin@test.hu" } });
  const writerUserExists = await prisma.user.findUnique({ where: { email: "writer@test.hu" } });

  if (adminUserExists && writerUserExists) {
    console.log("Admin and Writer user already exists. Skipping seeding.");
    return;
  }

  const adminHashedPassword = await bcrypt.hash("admin", SALT);
  const writerHashedPassword = await bcrypt.hash("writer", SALT);

  // Create admin user and assign ADMIN role
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@test.hu" },
    update: {},
    create: {
      email: "admin@test.hu",
      password: adminHashedPassword,
      firstName: "Admin",
      lastName: "User",
      UserRole: {
        create: {
          role: {
            connect: { id: adminRole.id },
          },
        },
      },
    },
  });

  // Create writer user and assign WRITER role
  const writerUser = await prisma.user.upsert({
    where: { email: "writer@test.hu" },
    update: {},
    create: {
      email: "writer@test.hu",
      password: writerHashedPassword,
      firstName: "Writer",
      lastName: "User",
      UserRole: {
        create: {
          role: {
            connect: { id: writerRole.id },
          },
        },
      },
    },
  });

  console.log(
    "Admin and Writer users seeded successfully\n\nUsername: admin@test.hu\nPassword: admin\n\nUsername: writer@test.hu\nPassword: writer",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
