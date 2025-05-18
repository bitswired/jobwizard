function getEnvOrThrow(key: string): string {
	const value = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}

export const SETTINGS = {
	COOKIE: {
		SECRET: "supersecret",
	},
	DB: {
		URL: process.env.NODE_ENV === "test" ? ":memory:" : getEnvOrThrow("DB_URL"),
	},
	WEBAPP: {
		URL: getEnvOrThrow("WEBAPP_URL"),
	},
};
