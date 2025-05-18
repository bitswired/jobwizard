import { sql } from "drizzle-orm";
import {
	int,
	integer,
	sqliteTable,
	text,
	unique,
} from "drizzle-orm/sqlite-core";

const common = {
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
		.$onUpdate(() => sql`(unixepoch() * 1000)`),
};

export const userTable = sqliteTable(
	"users",
	{
		id: int().primaryKey({ autoIncrement: true }),
		email: text().notNull(),
		passwordHash: text(),
		...common,
	},
	(t) => {
		unique().on(t.email);
	},
);

export const sessionTable = sqliteTable("sessions", {
	id: text().primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	userId: int("user_id").notNull(),
	...common,
});

export const table = {
	userTable,
	sessionTable,
} as const;

export type Table = typeof table;
