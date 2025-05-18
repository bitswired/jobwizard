import { z } from "zod";

// Base event schema
export const AgentEventBase = z.object({
	agentId: z.string(),
	agentName: z.string(),
});

export const AgentEventModelCompletionDone = z.object({
	event: z.literal("agent.model.completion.done"),
	data: AgentEventBase.merge(
		z.object({
			model: z.string(),
			inputTokens: z.number(),
			outputTokens: z.number(),
			totalTokens: z.number(),
		}),
	),
});
export type AgentEventModelCompletionDone = z.infer<
	typeof AgentEventModelCompletionDone
>;

// agent.created
export const AgentCreatedEvent = z.object({
	event: z.literal("agent.created"),
	data: AgentEventBase.merge(z.object({})),
});
export type AgentCreatedEvent = z.infer<typeof AgentCreatedEvent>;

// agent.start
export const AgentStartEvent = z.object({
	event: z.literal("agent.start"),
	data: AgentEventBase.merge(
		z.object({
			userMessage: z.string(),
		}),
	),
});
export type AgentStartEvent = z.infer<typeof AgentStartEvent>;

// agent.run.start
export const AgentRunStartEvent = z.object({
	event: z.literal("agent.run.start"),
	data: AgentEventBase.merge(
		z.object({
			toolCallId: z.string().optional(),
		}),
	),
});
export type AgentRunStartEvent = z.infer<typeof AgentRunStartEvent>;

// agent.tool_call.executing
export const AgentToolCallExecutingEvent = z.object({
	event: z.literal("agent.tool_call.executing"),
	data: AgentEventBase.merge(
		z.object({
			name: z.string(),
			args: z.any(),
			toolCallId: z.string(),
		}),
	),
});
export type AgentToolCallExecutingEvent = z.infer<
	typeof AgentToolCallExecutingEvent
>;

// agent.tool_call.result
export const AgentToolCallResultEvent = z.object({
	event: z.literal("agent.tool_call.result"),
	data: AgentEventBase.merge(
		z.object({
			name: z.string(),
			args: z.any(),
			result: z.any(),
			toolCallId: z.string(),
		}),
	),
});
export type AgentToolCallResultEvent = z.infer<typeof AgentToolCallResultEvent>;

// agent.complete
export const AgentCompleteEvent = z.object({
	event: z.literal("agent.complete"),
	data: AgentEventBase.merge(
		z.object({
			result: z.any(),
		}),
	),
});
export type AgentCompleteEvent = z.infer<typeof AgentCompleteEvent>;

export const AgentUserInteractionQuery = z.object({
	event: z.literal("agent.user_interaction.query"),
	data: AgentEventBase.merge(
		z.object({
			query: z.string(),
		}),
	),
});
export type AgentUserInteractionQuery = z.infer<
	typeof AgentUserInteractionQuery
>;

// Export union event type
export const AgentEvent = z.union([
	AgentCreatedEvent,
	AgentStartEvent,
	AgentRunStartEvent,
	AgentToolCallExecutingEvent,
	AgentToolCallResultEvent,
	AgentCompleteEvent,
	AgentEventModelCompletionDone,
	AgentUserInteractionQuery,
]);
export type AgentEvent = z.infer<typeof AgentEvent>;

// Notify function type remains unchanged.
export type NotifyFunction = (event: AgentEvent) => Promise<void>;
