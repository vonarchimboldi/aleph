import postgres from "postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const password = process.env.DB_PASSWORD;
if (!password) {
  console.error("DB_PASSWORD env var required");
  process.exit(1);
}

const sql = postgres({
  host: "aws-1-ap-southeast-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  username: "postgres.bkqvieebmjuyqxlgfwlf",
  password,
  ssl: "require",
  max: 1,
});

const migrationPath = join(__dirname, "..", "supabase", "migrations", "0005_unified_schema_extensions.sql");
const migration = readFileSync(migrationPath, "utf8");

console.log("Applying migration...");
try {
  await sql.unsafe(migration);
  console.log("Migration applied successfully.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await sql.end();
}
