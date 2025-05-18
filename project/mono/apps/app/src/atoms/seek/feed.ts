import type { AgentEvent } from "@agent/agents/events";
import {
	type OffersFinderOutput,
	OffersFinderOutputSchema,
	type RouterAgentOutput,
	RouterAgentOutputSchema,
	StatusInputSchema,
} from "@agent/agents/schemas";
import { db } from "@app/lib/db";
import { atom } from "jotai";
import type { RefObject } from "react";

type Event =
	| AgentEvent
	| {
			event: "user.query";
			data: {
				query: string;
			};
	  };

export type RootFeedElement = {
	type: "root";
	children: FeedElement[];
};

export type UserMessageFeedElement = {
	type: "user.message";
	state: {
		query: string;
	};
};
export type AgentElement = {
	type: "agent";
	state: {
		id: string;
		name: string;
		args: any;
		result: any;
	};
	children: (AgentElement | ToolElement)[];
};
export type ToolElement = {
	type: "tool";
	state: {
		agentId: string;
		agentName: string;
		name: string;
		args: any;
		result: any;
		toolCallId: string;
	};
};

export type FeedElement =
	| RootFeedElement
	| UserMessageFeedElement
	| AgentElement
	| ToolElement;

export const feedAtom = atom<RootFeedElement>({
	type: "root",
	children: [],
});

export const consumptionAtom = atom<
	{
		inputTokens: number;
		outputTokens: number;
		totalTokens: number;
	}[]
>([]);
export const consumptionSummaryAtom = atom((get) => {
	const consumption = get(consumptionAtom);

	const total = consumption.reduce(
		(acc, curr) => ({
			inputTokens: acc.inputTokens + curr.inputTokens,
			outputTokens: acc.outputTokens + curr.outputTokens,
			totalTokens: acc.totalTokens + curr.totalTokens,
		}),

		{
			inputTokens: 0,
			outputTokens: 0,
			totalTokens: 0,
		},
	);

	return total;
});

export const userInteractionAtom = atom<string | null>(null);

export const mainAgentStatusAtom = atom<"idle" | "running" | "done">("idle");

export const scrollToContainerBottomAtom = atom(null, (get) => {
	const container = get(messageContainerRefAtom);
	console.log("scrollToContainerBottomAtom", container);
	if (container?.current) {
		container.current.scrollTo({
			top: container.current.scrollHeight,
			behavior: "smooth",
		});
	}
});

export const messageContainerRefAtom =
	atom<RefObject<HTMLDivElement | null> | null>(null);

export const offersAtom = atom<OffersFinderOutput["offers"]>([]);
export const routerOutputAtom = atom<RouterAgentOutput["letters"]>([]);

export const statusMessagesAtom = atom<string[]>([]);

export const handleNewFeedEventAtom = atom(null, (get, set, event: Event) => {
	if (event.event === "agent.user_interaction.query") {
		set(userInteractionAtom, event.data.query);
	}

	if (event.event === "agent.model.completion.done") {
		set(consumptionAtom, (prev) => {
			console.log("Event data:", event.data);
			return [
				...prev,
				{
					inputTokens: event.data.inputTokens,
					outputTokens: event.data.outputTokens,
					totalTokens: event.data.totalTokens,
				},
			];
		});
	}

	set(feedAtom, (prev) => {
		const findInTree = (
			tree: FeedElement,
			predicate: (node: FeedElement) => boolean,
		): FeedElement | null => {
			if (predicate(tree)) {
				return tree;
			}

			if ("children" in tree) {
				for (const child of tree.children) {
					const found = findInTree(child, predicate);
					if (found) {
						return found;
					}
				}
			}

			return null;
		};

		switch (event.event) {
			case "user.query": {
				prev.children.push({
					type: "user.message",
					state: {
						query: event.data.query,
					},
				});
				return { ...prev };
			}
			case "agent.start": {
				if (event.data.agentName === "agent-router") {
					set(mainAgentStatusAtom, "running");
				}

				return prev;
			}
			case "agent.complete": {
				if (event.data.agentName === "agent-router") {
					const agent = findInTree(prev, (node) => {
						if (node.type === "agent") {
							return node.state.id === event.data.agentId;
						}
						return false;
					});

					if (agent?.type !== "agent") {
						throw new Error("Agent not found");
					}

					agent.state.result = event.data.result;

					set(mainAgentStatusAtom, "done");

					const parsedResult = RouterAgentOutputSchema.parse(event.data.result);
					set(routerOutputAtom, parsedResult.letters);

					const letters = get(routerOutputAtom);
					const offers = get(offersAtom);

					const s = letters.map((letter) => {
						const offer = offers.find((_offer, index) => index === letter.id);
						if (!offer) {
							throw new Error("Offer not found");
						}
						return {
							...offer,
							letter: letter.content,
						};
					});
					console.log(s);
					db.offers.bulkAdd(s).then(() => {
						console.log("Offers added to db");
					});

					setTimeout(() => {
						set(scrollToContainerBottomAtom);
					}, 1000);

					return { ...prev };
				}

				return prev;
			}
			case "agent.tool_call.executing": {
				const isAgent = event.data.name.startsWith("agent-");

				let parentAgent = findInTree(prev, (node) => {
					if (node.type === "agent") {
						return node.state.id === event.data.agentId;
					}
					return false;
				});
				if (!parentAgent) {
					prev.children.push({
						type: "agent",
						state: {
							id: event.data.agentId,
							name: event.data.agentName,
							args: null,
							result: null,
						},
						children: [],
					});
				}
				parentAgent = findInTree(prev, (node) => {
					if (node.type === "agent") {
						return node.state.id === event.data.agentId;
					}
					return false;
				});
				if (!parentAgent) {
					throw new Error("Parent agent not found");
				}
				if (parentAgent.type !== "agent") {
					throw new Error("Parent agent is not of type 'agent'");
				}

				if (isAgent) {
					parentAgent.children.push({
						type: "agent",
						state: {
							id: event.data.toolCallId,
							name: event.data.name,
							args: event.data.args,
							result: null,
						},
						children: [],
					});
				} else {
					parentAgent.children.push({
						type: "tool",
						state: {
							agentId: event.data.agentId,
							agentName: event.data.agentName,
							name: event.data.name,
							args: event.data.args,
							result: null,
							toolCallId: event.data.toolCallId,
						},
					});
				}

				setTimeout(() => {
					set(scrollToContainerBottomAtom);
				}, 1000);

				return { ...prev };
			}
			case "agent.tool_call.result": {
				if (event.data.name === "status") {
					const parsed = StatusInputSchema.parse(event.data.args);
					set(statusMessagesAtom, (prev) => {
						return [...prev, parsed.statusMessage];
					});
				}

				const isAgent = event.data.name.startsWith("agent-");

				if (isAgent) {
					const agent = findInTree(prev, (node) => {
						if (node.type === "agent") {
							return node.state.id === event.data.toolCallId;
						}
						return false;
					});
					if (!agent) {
						throw new Error("Agent not found");
					}
					if (agent.type !== "agent") {
						throw new Error("Agent is not of type 'agent'");
					}
					agent.state.result = event.data.result;
				} else {
					const toolCall = findInTree(prev, (node) => {
						if (node.type === "tool") {
							return node.state.toolCallId === event.data.toolCallId;
						}
						return false;
					});
					if (!toolCall) {
						throw new Error("Tool call not found");
					}
					if (toolCall.type !== "tool") {
						throw new Error("Tool call is not of type 'tool'");
					}
					toolCall.state.result = event.data.result;
				}

				if (event.data.name === "agent-offers-finder") {
					set(offersAtom, (prev) => {
						const parsedResult = OffersFinderOutputSchema.parse(
							event.data.result,
						);
						const offers = prev.concat(parsedResult.offers);
						return offers;
					});
				}

				setTimeout(() => {
					set(scrollToContainerBottomAtom);
				}, 1000);
				return { ...prev };
			}
			default:
				// console.log("Unhandled event type:", event.event);
				return prev;
		}
	});
});

// add bright data
// better cover letters example
// better offer seelction
// personnnalize with cv
// referrals
