import { getMcpClient } from "../src";
import { getMcpTools, mcpToolCaller } from "../src/agents";
import { Agent } from "../src/agents/agent";
import type { AgentEvent, NotifyFunction } from "../src/agents/events";

async function test_browser() {
	const mcpClient = await getMcpClient();

	const notify: NotifyFunction = async (event: AgentEvent) => {
		console.log(event);
	};

	const agent = new Agent({
		id: "test",
		name: "agent-offers-finder",
		system:
			"Your role is to use the browser tools at your disposal to accomplish the user action",
		tools: await getMcpTools(mcpClient, [
			"search_engine",
			"scraping_browser_navigate",
			"scraping_browser_go_back",
			"scraping_browser_go_forward",
			"scraping_browser_links",
			"scraping_browser_click",
			"scraping_browser_type",
			"scraping_browser_wait_for",
			"scraping_browser_screenshot",
			"scraping_browser_get_text",
			"scraping_browser_get_html",
		]),
		toolCaller: mcpToolCaller(mcpClient),
		notify,
	});

	const res = await agent.start(
		"Find the linkedin profile of Jimi Vaubien and visit the profile and user the browser tools to navigate teh profile and extract the experience section of his profile with all his professional experiences",
	);

	console.log(res);
}

async function test_t() {
	const mcpClient = await getMcpClient();
	const tools = await mcpClient.listTools();
	console.log(JSON.stringify(tools, null, 2));

	const res = await mcpClient.callTool({
		name: "scraping_browser_navigate",
		arguments: {
			url: "https://google.com/search?q=test",
		},
	});
	console.log(res);
	const rres = await mcpClient.callTool({
		name: "scraping_browser_links",
		arguments: {},
	});
	console.log(rres);
}

//await test_t();

await test_browser();
