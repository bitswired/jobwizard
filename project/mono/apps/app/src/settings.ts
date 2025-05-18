function getEnvOrThrow(key: string): string {
	const value = import.meta.env[key];
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
}

export const SETTINGS = {
	API: {
		BASE_URL: getEnvOrThrow("VITE_API_BASE_URL"),
		WEBSOCKET_URL: getEnvOrThrow("VITE_API_WEBSOCKET_URL"),
	},
};
