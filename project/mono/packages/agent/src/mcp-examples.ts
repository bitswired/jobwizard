import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function getMcpClient() {
	const transport = new StdioClientTransport({
		command: "/opt/homebrew/bin/bunx",
		args: ["@brightdata/mcp"],
		env: {
			API_TOKEN: process.env.BRIGHT_DATA_API_KEY ?? "",
		},
	});

	const client = new Client({
		name: "example-client",
		version: "1.0.0",
	});

	await client.connect(transport);

	return client;
}

async function listBrightDataMcpTools() {
	const mcpClient = await getMcpClient();
	const res = await mcpClient.ping();
	console.log(res);

	const { tools } = await mcpClient.listTools();
	console.log(tools);
}

async function searchEngine() {
	const mcpClient = await getMcpClient();

	const { tools } = await mcpClient.listTools();
	const tool = tools.find((x) => x.name === "search_engine");
	console.log(tool);

	const res = await mcpClient.callTool({
		name: "search_engine",
		arguments: { query: "What are the news today?" },
	});
	console.log(res);
}

async function scrapeAsMarkdown() {
	const mcpClient = await getMcpClient();

	const { tools } = await mcpClient.listTools();
	const tool = tools.find((x) => x.name === "scrape_as_markdown");
	console.log(tool);

	const res = await mcpClient.callTool({
		name: "scrape_as_markdown",
		arguments: { url: "https://openai.com/news" },
	});
	console.log(res);
}

async function linkedinCompany() {
	const mcpClient = await getMcpClient();

	const { tools } = await mcpClient.listTools();
	const tool = tools.find(
		(x) => x.name === "web_data_linkedin_company_profile",
	);
	console.log(tool);

	const res = await mcpClient.callTool({
		name: "web_data_linkedin_company_profile",
		arguments: { url: "https://www.linkedin.com/company/nvidia" },
	});
	console.log(res);
}

async function main() {
	const example = Bun.argv[2];

	switch (example) {
		case "list-tools": {
			return await listBrightDataMcpTools();
		}
		case "search-engine": {
			return await searchEngine();
		}
		case "scrape": {
			return await scrapeAsMarkdown();
		}
		case "linkedin": {
			return await linkedinCompany();
		}
		default: {
			throw new Error("Invalid example");
		}
	}
}

await main();
