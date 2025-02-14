import prisma from "../lib/db";
import bcrypt from "bcrypt";

async function main() {
  // Insert roles
  const roles = ["ADMIN", "WRITER"];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }
  console.log("Roles seeded successfully");

  // Fetch the ADMIN role ID
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
    select: { id: true },
  });

  if (!adminRole) {
    throw new Error("ADMIN role not found");
  }

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "admin@test.hu" },
  });

  if (existingUser) {
    console.log("Admin user already exists. Skipping seeding.");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin", 10);

  // Create admin user and assign ADMIN role
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@test.hu" },
    update: {},
    create: {
      email: "admin@test.hu",
      password: hashedPassword,
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

  console.log("Admin user seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
