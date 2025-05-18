import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type Openai from "openai";
import { Agent, type ToolCaller } from "./agent";

import { zodToJsonSchema } from "zod-to-json-schema";

import type { NotifyFunction } from "./events";
import offerEnricherSystemPrompt from "./offer-enricher-system.txt";
import offersFinderSystemPrompt from "./offers-finder-system.txt";
import routerSystemPrompt from "./router-system.txt";

import {
	EnrichedJobOfferSchema,
	JobOfferSchema,
	OfferEnricherOutputSchema,
	OffersFinderInputSchema,
	OffersFinderOutputSchema,
	PersonalizerInputSchema,
	PersonalizerOutputSchema,
	RouterAgentOutputSchema,
	UserInteractionInputSchema,
	UserInteractionSelectInputSchema,
} from "./schemas";

export type { Agent } from "./agent";
export type { NotifyFunction } from "./events";

export const mcpToolCaller: (mcpClient: Client) => ToolCaller = (
	mcpClient: Client,
) => {
	return async (name: string, args: any) => {
		try {
			const res = await mcpClient.callTool({
				name,
				arguments: args,
			});
			return res.content[0].text;
		} catch (error) {
			console.error("Error calling tool", error);
			return "Error calling tool";
		}
	};
};

export async function getMcpTools(mcpClient: Client, enabledTools: string[]) {
	const { tools } = await mcpClient.listTools();

	const agentTools: Openai.Responses.Tool[] = tools
		.filter((tool) => enabledTools.includes(tool.name))
		.map((tool) => {
			const schema = tool.inputSchema;
			let autoSchema = schema;

			// If properties are defined, sanitize them and automatically add all keys to required
			if (schema.properties) {
				const sanitizedProperties = Object.fromEntries(
					Object.entries(schema.properties).map(([key, propSchema]) => {
						// remove unsupported keywords like "format"
						const { format, ...rest } = propSchema as Record<string, any>;
						return [key, rest];
					}),
				);

				autoSchema = {
					...schema,
					properties: sanitizedProperties,
					required: Object.keys(sanitizedProperties),
				};
			}

			return {
				type: "function",
				name: tool.name,
				description: tool.description,
				parameters: autoSchema,
				strict: true,
			};
		});
	return agentTools;
}

export async function agentBuilder({
	mcpClient,
	agentName,
	notify,
	id,
}: {
	mcpClient: Client;
	agentName: string;
	notify: NotifyFunction;
	id?: string;
}) {
	switch (agentName) {
		case "agent-offers-finder":
			return new Agent({
				id,
				name: "agent-offers-finder",
				system: offersFinderSystemPrompt,
				tools: await getMcpTools(mcpClient, [
					"search_engine",
					"scrape_as_markdown",
				]),
				toolCaller: mcpToolCaller(mcpClient),
				structuredOutput: OffersFinderOutputSchema,
				notify,
			});
		case "agent-offer-enricher":
			return new Agent({
				id,
				name: "agent-offer-enricher",
				system: offerEnricherSystemPrompt,
				tools: await getMcpTools(mcpClient, [
					"search_engine",
					"scrape_as_markdown",
					"web_data_linkedin_company_profile",
				]),
				toolCaller: mcpToolCaller(mcpClient),
				structuredOutput: OfferEnricherOutputSchema,
				notify,
			});
		default:
			throw new Error(`Agent ${agentName} not found`);
	}
}

export function getRouterAgent({
	mcpClient,
	notify,
	userInteractionFunction,
}: {
	mcpClient: Client;
	notify: NotifyFunction;
	userInteractionFunction: (query: string) => Promise<string>;
}) {
	const tools: Openai.Responses.Tool[] = [
		{
			type: "function",
			name: "agent-offers-finder",
			description: `Agent that finds job offers based on a prompt describing the needs. Returns a list of job offers in the shape: ${zodToJsonSchema(JobOfferSchema)}`,
			parameters: zodToJsonSchema(OffersFinderInputSchema),
			strict: true,
		},
		{
			type: "function",
			name: "user-interaction",
			description:
				"Interact withe the user by displaying a prompt in markdown, return the user answer",
			parameters: zodToJsonSchema(UserInteractionInputSchema),
			strict: true,
		},
		{
			type: "function",
			name: "user-interaction-select",
			description:
				"Interact withe the user by displaying a prompt in markdown, and providing choices that will be displayed to the user as multi select (they can select 1 or more values), return the user answers",
			parameters: zodToJsonSchema(UserInteractionSelectInputSchema),
			strict: true,
		},
		{
			type: "function",
			name: "agent-offer-enricher",
			description: `Enrich a job offer with additional information. Returns the enriched job offer in the shape: ${zodToJsonSchema(
				EnrichedJobOfferSchema,
			)}`,
			parameters: zodToJsonSchema(JobOfferSchema),
			strict: true,
		},
		{
			type: "function",
			name: "personalizer",
			description: `Create a personalized cover letter for a job offer. Returns the cover letter in the shape: ${zodToJsonSchema(
				PersonalizerOutputSchema,
			)}`,
			parameters: zodToJsonSchema(PersonalizerInputSchema),
			strict: true,
		},
	];

	const toolCaller: ToolCaller = async (
		name: string,
		args: any,
		toolCallId: string,
	) => {
		console.log("Tool called:", name, args);

		switch (name) {
			case "agent-offers-finder": {
				const offersFinderAgent = await agentBuilder({
					id: toolCallId,
					mcpClient,
					agentName: "agent-offers-finder",
					notify,
				});
				const res = await offersFinderAgent.start(JSON.stringify(args));
				return res;
			}

			case "user-interaction": {
				const res = await userInteractionFunction(JSON.stringify(args));
				return res;
			}

			case "user-interaction-select": {
				const res = await userInteractionFunction(JSON.stringify(args));
				return res;
			}

			case "agent-offer-enricher": {
				const offerEnricherAgent = await agentBuilder({
					id: toolCallId,
					mcpClient,
					agentName: "agent-offer-enricher",
					notify,
				});
				const res = await offerEnricherAgent.start(JSON.stringify(args));
				return res;
			}

			default:
				throw new Error(`Tool ${name} not found`);
		}
	};

	return new Agent({
		name: "agent-router",
		system: routerSystemPrompt,
		tools: tools.slice(0, 3),
		toolCaller,
		notify,
		structuredOutput: RouterAgentOutputSchema,
	});
}
