import { defineConfig } from "drizzle-kit";

import { SETTINGS } from "./src/settings";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: SETTINGS.DB.URL,
	},
});
