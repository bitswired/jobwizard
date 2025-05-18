import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { getRouterAgent } from "./agents";
import type { NotifyFunction } from "./agents/events";
export { getRouterAgent } from "./agents";
export type { Agent, NotifyFunction } from "./agents";

export async function getMcpClient() {
	const transport = new StdioClientTransport({
		// command: "/opt/homebrew/bin/bunx",
		// command: "/usr/local/bin/bunx",
		command: process.env.BUNX_COMMAND ?? "",
		args: ["@brightdata/mcp"],
		env: {
			API_TOKEN: process.env.BRIGHT_DATA_API_KEY ?? "",
		},
	});

	//const transport = new SSEClientTransport(
	//	new URL("http://localhost:8080/sse"),
	//);

	const client = new Client({
		name: "example-client",
		version: "1.0.0",
	});

	await client.connect(transport);

	return client;
}

async function main() {
	const mcpClient = await getMcpClient();

	const notify: NotifyFunction = async (event) => {
		console.log("Event:", event.event);
	};

	const routerAgent = getRouterAgent({
		mcpClient,
		notify,
	});

	const res = await routerAgent.start(
		"Give me interesting job offers for AI Engineer in Swizerland Lausanne",
	);

	console.log("Response:", res);
}

// await main();
