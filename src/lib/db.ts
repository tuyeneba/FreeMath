import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";

// Resolve the SQLite database path relative to the workspace root
let dbPath = path.resolve(process.cwd(), "prisma/dev.db");

// On Vercel (read-only filesystem), copy the template database to /tmp so we can write to it
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const tempDbPath = "/tmp/dev.db";
  const tempDir = path.dirname(tempDbPath);
  
  // Ensure the temp directory exists
  if (!fs.existsSync(tempDir)) {
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch (err) {
      console.error("Failed to create temp directory:", err);
    }
  }

  if (!fs.existsSync(tempDbPath)) {
    try {
      console.log(`Copying database template from ${dbPath} to ${tempDbPath}`);
      fs.copyFileSync(dbPath, tempDbPath);
      console.log("Database template copied successfully.");
    } catch (err) {
      console.error("Failed to copy template database:", err);
    }
  }
  dbPath = tempDbPath;
}

const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
