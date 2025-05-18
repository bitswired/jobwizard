import { Elysia } from "elysia";

import { getMcpClient } from "@workspace/agent";

const mcpClient = await getMcpClient();

export const mcpService = new Elysia({ name: "service/mcp" })
	.decorate("mcpClient", mcpClient)
	.as("scoped");
