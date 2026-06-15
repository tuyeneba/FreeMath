/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.resolve(__dirname, "dev.db");
// Prisma 7: Pass config object with url to PrismaBetterSqlite3 constructor
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  // Student user
  const username = "nhi0908664418";
  const password = "taptrung";
  const passwordHash = hashPassword(password);

  console.log(`Seeding user ${username}...`);
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: {
      username,
      passwordHash,
      fullName: "Nhi Superbrain",
      powerScore: 1200,
      theme: "light",
      language: "vi",
      level: "Basic",
      role: "user",
    },
  });

  // Admin user
  const adminUsername = "admin";
  const adminPassword = "Freem@th";
  const adminPasswordHash = hashPassword(adminPassword);

  console.log(`Seeding admin user ${adminUsername}...`);
  await prisma.user.upsert({
    where: { username: adminUsername },
    update: { passwordHash: adminPasswordHash },
    create: {
      username: adminUsername,
      passwordHash: adminPasswordHash,
      fullName: "System Administrator",
      powerScore: 9999,
      theme: "light",
      language: "vi",
      level: "Basic",
      role: "admin",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
