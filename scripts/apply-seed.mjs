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

const seedPath = process.env.SEED_PATH || join(__dirname, "..", "..", "aleph_v2", "supabase", "seed.sql");
const seed = readFileSync(seedPath, "utf8");

console.log("Applying seed from", seedPath);
try {
  await sql.unsafe(seed);
  console.log("Seed applied successfully.");
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
} finally {
  await sql.end();
}
