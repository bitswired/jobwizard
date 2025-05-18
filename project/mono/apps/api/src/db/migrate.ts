import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./drizzle" });
