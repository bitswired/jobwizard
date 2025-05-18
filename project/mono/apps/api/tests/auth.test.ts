import { db } from "@api/db";
import { app } from "@api/index";
import { treaty } from "@elysiajs/eden";
import { beforeAll, describe, expect, it } from "bun:test";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const api = treaty(app);

beforeAll(async () => {
	migrate(db, {
		migrationsFolder: "./drizzle",
	});
});

describe("Elysia", () => {
	it("return a response", async () => {
		const signUpRes = await api.auth.username.signup.post({
			email: "test@test.com",
			password: "password",
		});
		expect(signUpRes.status).toBe(200);

		const loginRes = await api.auth.username.login.post({
			email: "test@test.com",
			password: "password",
		});
		expect(signUpRes.status).toBe(200);

		const meRes = await api.auth.me.get({
			headers: {
				cookie: loginRes.response.headers.get("set-cookie") ?? "",
			},
		});
		expect(meRes.status).toBe(200);
		expect(meRes.data?.email).toBe("test@test.com");
	});
});
