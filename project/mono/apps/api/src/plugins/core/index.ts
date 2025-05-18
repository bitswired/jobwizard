import type { AgentUserInteractionQuery } from "@agent/agents/events";
import {
	type NotifyFunction,
	type getMcpClient,
	getRouterAgent,
} from "@workspace/agent";
import { Elysia, t } from "elysia";
import { authService } from "../auth";
import { mcpService } from "../mcp";

interface WebsocketClient {
	send: (message: string) => void;
	agentId?: string;
	agentName?: string;
	agentPromise?: Promise<any>;
	userResponse?: string;
}

class WebsocketManager {
	clients: Record<string, WebsocketClient>;

	constructor() {
		this.clients = {};
	}

	getUserInteractionFunction(id: string) {
		const client = this.clients[id];
		if (!client) {
			throw new Error(`Client ${id} not found`);
		}

		return async (query: string) => {
			if (!client.agentId || !client.agentName) {
				throw new Error(`Client ${id} not running an agent`);
			}

			const x: AgentUserInteractionQuery = {
				event: "agent.user_interaction.query",
				data: {
					agentId: client.agentId,
					agentName: client.agentName,
					query,
				},
			};

			client.send(JSON.stringify(x));

			while (true) {
				// console.log("Waiting for user response ...");
				if (client.userResponse) {
					const response = client.userResponse;
					client.userResponse = undefined;
					return response;
				}
				await Bun.sleep(1000);
			}
		};
	}

	setUserResponse(id: string, response: string) {
		console.log("setUserResponse", id, response);
		const client = this.clients[id];
		if (!client) {
			throw new Error(`Client ${id} not found`);
		}
		client.userResponse = response;
	}

	addClient(id: string, client: WebsocketClient) {
		this.clients[id] = client;
	}
	getNotifyFunction(id: string): NotifyFunction {
		const client = this.clients[id];
		if (!client) {
			throw new Error(`Client ${id} not found`);
		}
		return async (event) => {
			console.log("Notify function", JSON.stringify(event));
			client.send(JSON.stringify(event));
		};
	}

	runAgent(
		id: string,
		input: string,
		mcpClient: Awaited<ReturnType<typeof getMcpClient>>,
	) {
		console.log("runAgent", id, input);
		const client = this.clients[id];
		if (!client) {
			throw new Error(`Client ${id} not found`);
		}
		const agent = getRouterAgent({
			mcpClient,
			notify: this.getNotifyFunction(id),
			userInteractionFunction: this.getUserInteractionFunction(id),
		});

		const agentPromise = agent.start(input);
		client.agentPromise = agentPromise;
		client.agentId = agent.id;
		client.agentName = agent.name;
	}
}

export const coreService = new Elysia()
	.use(mcpService)
	.use(authService)
	.guard({
		isLoggedIn: true,
	})
	.decorate("manager", new WebsocketManager())
	.ws("/ws", {
		body: t.Object({
			type: t.Union([
				t.Literal("user.query"),
				t.Literal("user.interaction.response"),
			]),
			message: t.String(),
		}),

		open(ws) {
			ws.data.manager.addClient(ws.id, {
				send: (message: string) => {
					ws.send(message);
				},
			});
		},
		message(ws, { type, message }) {
			switch (type) {
				case "user.query":
					ws.data.manager.runAgent(ws.id, message, ws.data.mcpClient);
					break;
				case "user.interaction.response":
					ws.data.manager.setUserResponse(ws.id, message);
					break;
				default:
					console.error("Unknown message type:", type);
			}
		},
	});
