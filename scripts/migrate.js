require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const sqlDirectory = path.join(__dirname, "..", "sql");
const sqlFiles = fs
  .readdirSync(sqlDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort();

function ensurePsqlAvailable() {
  const result = spawnSync("psql", ["--version"], { encoding: "utf8" });

  if (result.status !== 0) {
    console.error("psql was not found. Install the PostgreSQL client and ensure 'psql' is on your PATH.");
    process.exit(1);
  }
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
}

function applySqlFile(fileName, connectionString) {
  const filePath = path.join(sqlDirectory, fileName);
  console.log(`Applying ${fileName} ...`);

  const result = spawnSync(
    "psql",
    ["-v", "ON_ERROR_STOP=1", "-X", "-d", connectionString, "-f", filePath],
    { stdio: "inherit", env: process.env }
  );

  if (result.status !== 0) {
    console.error(`Failed to apply ${fileName}.`);
    process.exit(result.status || 1);
  }
}

function main() {
  ensurePsqlAvailable();

  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    console.error("Missing DATABASE_URL. Set DATABASE_URL in your environment or .env to a PostgreSQL connection string before running npm run migrate.");
    process.exit(1);
  }

  console.log("Resetting the public schema...");
  const resetResult = spawnSync(
    "psql",
    ["-v", "ON_ERROR_STOP=1", "-X", "-d", connectionString, "-c", "drop schema if exists public cascade; create schema public;"],
    { stdio: "inherit", env: process.env }
  );

  if (resetResult.status !== 0) {
    console.error("Failed to reset the public schema.");
    process.exit(resetResult.status || 1);
  }

  for (const fileName of sqlFiles) {
    applySqlFile(fileName, connectionString);
  }

  console.log("Database migration complete.");

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL && !process.env.SKIP_SEED) {
    console.log("Seeding default couple accounts...");
    const seedResult = spawnSync("node", ["scripts/seed.js"], { stdio: "inherit", env: process.env });

    if (seedResult.status !== 0) {
      console.error("Migration completed, but seeding failed.");
      process.exit(seedResult.status || 1);
    }
  } else if (!process.env.SKIP_SEED) {
    console.log("Skipping seed because SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not defined.");
  }
}

main();
