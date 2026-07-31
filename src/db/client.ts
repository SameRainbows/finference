import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ??
    "postgresql://build:build@127.0.0.1:5432/finference"
  );
}

const globalDatabase = globalThis as typeof globalThis & {
  finferenceDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export const db =
  globalDatabase.finferenceDb ??
  drizzle({
    client: neon(getDatabaseUrl()),
    schema,
    casing: "snake_case",
  });

if (process.env.NODE_ENV !== "production") {
  globalDatabase.finferenceDb = db;
}
