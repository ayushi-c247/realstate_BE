import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ------------------ ADMIN USER ------------------
async function seedAdmin() {
  const adminEmail = "admin.c247@yopmail.com";
  const existingAdmin = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Admin@c247", 10);
    await prisma.user.create({
      data: {
        first_name: "Admin",
        last_name: "User",
        full_name: "Admin User",
        email: adminEmail,
        password: passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        is_email_verified: true,
      },
    });

    console.info(`Admin "${adminEmail}" created."`);
  } else {
    console.info(`Admin "${adminEmail}" already exists.`);
  }
}

// ------------------ MAIN ------------------
async function main() {
  await seedAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
