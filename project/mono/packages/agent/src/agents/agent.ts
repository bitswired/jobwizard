import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ZodTypeAny } from "zod";
import { logger } from "../logger";
import type { NotifyFunction } from "./events";

export const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export type ToolCaller = (
	name: string,
	args: any,
	tooCallId: string,
) => Promise<any>;

export class Agent<T extends ZodTypeAny = never> {
	name: string;
	history: OpenAI.Responses.ResponseInput;
	tools: OpenAI.Responses.Tool[];
	toolCaller: ToolCaller;
	system: string;
	structuredOutput?: T;
	notify: NotifyFunction;
	id: string;

	constructor({
		name,
		tools,
		toolCaller,
		system,
		structuredOutput,
		notify,
		id,
	}: {
		name: string;
		tools: OpenAI.Responses.Tool[];
		toolCaller: ToolCaller;
		system: string;
		structuredOutput?: T;
		notify: NotifyFunction;
		id?: string;
	}) {
		this.id = id ?? crypto.randomUUID();
		this.history = [
			{
				role: "system",
				content: system,
			},
		];
		this.tools = tools;
		this.toolCaller = toolCaller;
		this.system = system;
		this.structuredOutput = structuredOutput;
		this.name = name;
		this.notify = notify;

		this.notify({
			event: "agent.created",
			data: {
				agentId: this.id,
				agentName: this.name,
			},
		}).then((x) => console.log("Agent created event sent", x));
	}

	async run(): Promise<T | string> {
		await this.notify({
			event: "agent.run.start",
			data: {
				agentId: this.id,
				agentName: this.name,
			},
		});
		logger.info(
			{
				message: "Running agent",
				agentId: this.id,
				agentName: this.name,
			},
			`Running agent ${this.name}`,
		);
		const stream = await openai.responses.create({
			model: "gpt-4.1-mini",
			input: this.history,
			parallel_tool_calls: true,
			tools: this.tools,
			stream: true,
			...(this.structuredOutput && {
				text: {
					format: zodTextFormat(this.structuredOutput, "event"),
				},
			}),
		});

		const finalToolCalls: Record<
			number,
			OpenAI.Responses.ResponseFunctionToolCall
		> = {};

		const messageStream = "";
		let message: OpenAI.Responses.ResponseOutputMessage | undefined = undefined;

		for await (const event of stream) {
			if (event.type === "response.output_item.added") {
				if (event.item.type === "function_call") {
					finalToolCalls[event.output_index] = event.item;
				} else if (event.item.type === "message") {
					message = event.item;
				}
			} else if (event.type === "response.output_item.done") {
				if (event.item.type === "function_call") {
					finalToolCalls[event.output_index] = event.item;
				} else if (event.item.type === "message") {
					message = event.item;
				}
			} else if (event.type === "response.function_call_arguments.delta") {
				const index = event.output_index;

				if (finalToolCalls[index]) {
					finalToolCalls[index].arguments += event.delta;
				}
			} else if (event.type === "response.output_text.delta") {
				messageStream;
			} else if (event.type === "response.completed" && event.response.usage) {
				await this.notify({
					event: "agent.model.completion.done",
					data: {
						agentId: this.id,
						agentName: this.name,
						model: "gpt-4.1-mini",
						inputTokens: event.response.usage.input_tokens,
						outputTokens: event.response.usage.output_tokens,
						totalTokens: event.response.usage.total_tokens,
					},
				});
			}
		}

		const toolCallPromises = Object.values(finalToolCalls).map(
			async (toolCall) => {
				const name = toolCall.name;
				const args = JSON.parse(toolCall.arguments);
				await this.notify({
					event: "agent.tool_call.executing",
					data: {
						agentId: this.id,
						agentName: this.name,
						name,
						args,
						toolCallId: toolCall.call_id,
					},
				});
				logger.info(
					{
						agentId: this.id,
						agentName: this.name,
						toolName: name,
					},
					`Agent ${this.name} Calling tool ${name} with args ${JSON.stringify(args).slice(0, 100)}`,
				);

				this.history.push(toolCall);

				const res = await this.toolCaller(name, args, toolCall.call_id);

				await this.notify({
					event: "agent.tool_call.result",
					data: {
						agentId: this.id,
						agentName: this.name,
						name,
						args,
						result: res,
						toolCallId: toolCall.call_id,
					},
				});

				this.history.push({
					type: "function_call_output",
					call_id: toolCall.call_id,
					output: JSON.stringify(res),
				});
			},
		);
		await Promise.all(toolCallPromises);

		if (Object.keys(finalToolCalls).length > 0) {
			logger.info(
				{
					agentId: this.id,
					agentName: this.name,
				},
				`Agent ${this.name} initiating a new run after tool calls`,
			);
			return await this.run();
		}

		if (message) {
			logger.info(
				{
					agentId: this.id,
					agentName: this.name,
				},
				`Agent ${this.name} wrote message`,
			);
			this.history.push(message);
		}

		if (message?.content[0]?.type !== "output_text") {
			throw new Error(
				`Agent ${this.name} did not return a message, but a ${message?.content[0]?.type}`,
			);
		}

		if (this.structuredOutput) {
			logger.info(
				{
					agentId: this.id,
					agentName: this.name,
				},
				`Agent ${this.name} got structured output`,
			);

			return this.structuredOutput.parse(JSON.parse(message?.content[0].text));
		}

		return message?.content[0].text;
	}

	async start(message: string) {
		await this.notify({
			event: "agent.start",
			data: {
				agentId: this.id,
				agentName: this.name,
				userMessage: message,
			},
		});

		this.history.push({
			role: "user",
			content: message,
		});

		const res = await this.run();

		await this.notify({
			event: "agent.complete",
			data: {
				agentId: this.id,
				agentName: this.name,
				result: res,
			},
		});

		return res;
	}
}
