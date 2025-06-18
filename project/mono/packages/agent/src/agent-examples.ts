import type OpenAI from "openai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { Agent } from "./agents/agent";
import type { AgentEvent } from "./agents/events";

async function basics() {
	const toolCaller = async (name: string, args: any) => "";
	const notify = async (event: AgentEvent) => console.log(event);

	const agent = new Agent({
		name: "agent-example",
		system: "You are an agent.",
		tools: [],
		toolCaller,
		notify,
	});

	const result = await agent.start("How are you today?");
	console.log(result);
}

async function structuredOutput() {
	const toolCaller = async (name: string, args: any) => "";
	const notify = async (event: AgentEvent) => console.log(event);

	const agent = new Agent({
		name: "agent-example",
		system: "You are an agent.",
		tools: [],
		toolCaller,
		notify,
		structuredOutput: z.object({
			people: z.array(
				z.object({
					name: z.string(),
					age: z.number(),
				}),
			),
		}),
	});

	const result = await agent.start("Alice is 32 and Bob is 27");
	console.log(result);
}

async function toolCall() {
	const notify = async (event: AgentEvent) => console.log(event);

	const tools: OpenAI.Responses.Tool[] = [
		{
			type: "function",
			name: "fetch-availability",
			description:
				"Returns the available slots in the user calendar for a given day",
			parameters: zodToJsonSchema(z.object({ day: z.string() })),
			strict: true,
		},
		{
			type: "function",
			name: "schedule-event",
			description: "Schedule event in the user calendar",
			parameters: zodToJsonSchema(
				z.object({
					date: z.string(),
					startHour: z.number(),
					endHour: z.number(),
				}),
			),
			strict: true,
		},
	];
	const toolCaller = async (name: string, args: any) => {
		if (name === "fetch-availability") {
			return "8:00-12:00 - 14:00-18:00";
		}

		if (name === "schedule-event") {
			console.log(args);
			return "Event scheduled";
		}
		throw new Error("Unsupported Function");
	};

	const agent = new Agent({
		name: "agent-example",
		system: "You are a scheduling agent.",
		tools,
		toolCaller,
		notify,
	});

	const result = await agent.start(
		"Schedule my dentist appointement for June 28th if possible in the afternoon",
	);
	console.log(result);
}

async function main() {
	const example = Bun.argv[2];

	switch (example) {
		case "basics": {
			return await basics();
		}
		case "structured": {
			return await structuredOutput();
		}
		case "tool": {
			return await toolCall();
		}
		default: {
			throw new Error("Invalid example");
		}
	}
}

await main();
