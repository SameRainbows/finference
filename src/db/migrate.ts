import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required");
}

const db = drizzle(neon(databaseUrl));

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Finference database migrations applied.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
