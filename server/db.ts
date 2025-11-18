import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

/**
 * Database configuration
 * 
 * Add your DATABASE_URL to .env to enable database features
 * Example: postgresql://user:password@host:port/database
 */

let pool: any = null;
let db: any = null;

if (!process.env.DATABASE_URL) {
  console.log("📦 No database configured - Frontend serving only");
  console.log("💡 Add DATABASE_URL to .env to enable backend features");
} else {
  const sql = neon(process.env.DATABASE_URL!);
  pool = sql;
  db = drizzle(sql, { schema });
  console.log("✅ Database connected");
}

export { pool, db };
