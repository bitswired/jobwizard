import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { SETTINGS } from "../settings";
import * as schema from "./schema";

const sqlite = new Database(SETTINGS.DB.URL);
export const db = drizzle({ client: sqlite, schema });

migrate(db, { migrationsFolder: "./drizzle" });

db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");
db.run("PRAGMA busy_timeout = 5000;"); // Set a timeout of 5 seconds for busy database
db.run("PRAGMA synchronous = NORMAL;"); // Set synchronous mode to NORMAL for better performance
db.run("PRAGMA cache_size = 10000;"); // Set cache size to 10MB
db.run("PRAGMA temp_store = MEMORY;"); // Use memory for temporary tables
