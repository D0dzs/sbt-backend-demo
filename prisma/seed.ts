import prisma from "../lib/db";
import bcrypt from "bcrypt";

const SALT = parseInt(process.env.SALT!);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const WRITER_PASSWORD = process.env.WRITER_PASSWORD!;

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
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" }, select: { id: true } });
  const writerRole = await prisma.role.findUnique({ where: { name: "writer" }, select: { id: true } });

  if (!adminRole || !writerRole) throw new Error("'admin' or 'writer' role not found");

  // Check if admin user already exists
  const adminUserExists = await prisma.user.findUnique({ where: { email: "admin@test.hu" }, select: { id: true } });
  const writerUserExists = await prisma.user.findUnique({ where: { email: "writer@test.hu" }, select: { id: true } });

  if (adminUserExists && writerUserExists) {
    console.log("Admin and Writer user already exists. Skipping seeding.");
    return;
  }

  const adminHashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT);
  const writerHashedPassword = await bcrypt.hash(WRITER_PASSWORD, SALT);

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
    "\nAdmin and Writer users seeded successfully\n\nUsername: admin@test.hu\nPassword: admin\n\nUsername: writer@test.hu\nPassword: writer",
  );

  // create template posts
  const createPost = await prisma.post.create({
    data: {
      title: "First Post",
      slug: "first-post",
      content: "This is the first post.",
      shortDesc: "This is the first post.",
      publishedAt: new Date(),
      publishedById: adminUser.id,
    },
  });

  const createSecondPost = await prisma.post.create({
    data: {
      title: "Second Post",
      slug: "second-post",
      content: "This is the second post.",
      shortDesc: "This is the second post.",
      publishedAt: new Date(),
      publishedById: writerUser.id,
    },
  });

  if (createPost && createSecondPost) {
    console.log("\nPosts seeded successfully");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
