import { S3Client } from "bun";

function getEnvOrThrow(key: string) {
	const res = process.env[key];
	if (!res) {
		throw new Error(`Missing env variable: ${key}`);
	}
	return res;
}

// CloudFlare R2
export const r2 = new S3Client({
	accessKeyId: getEnvOrThrow("STORAGE_ACCESS_KEY_ID"),
	secretAccessKey: getEnvOrThrow("STORAGE_ACCESS_KEY_SECRET"),
	bucket: getEnvOrThrow("STORAGE_BUCKET"),
	endpoint: getEnvOrThrow("STORAGE_ENDPOINT"),
});
