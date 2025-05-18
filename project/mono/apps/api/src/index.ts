import { auth } from "@api/plugins/auth";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { Elysia } from "elysia";
import { coreService } from "./plugins/core";
import { SETTINGS } from "./settings";

export const app = new Elysia()
	.use(
		cors({
			credentials: true,
			origin: [SETTINGS.WEBAPP.URL],
		}),
	)
	.use(swagger())
	.use(auth)
	.use(coreService)
	.listen(3000);

export type App = typeof app;

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
