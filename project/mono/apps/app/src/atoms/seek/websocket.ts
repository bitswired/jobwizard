import { AgentEvent } from "@agent/agents/events";
import { atom } from "jotai";
import { handleNewFeedEventAtom } from "./feed";

// Atom for WebSocket instance
export const socketAtom = atom<WebSocket | null>(null);

// Atom for connection status
export const statusAtom = atom<"connected" | "disconnected">("disconnected");

// Atom to initialize WebSocket connection
export const initializeSocketAtom = atom(null, (_get, set, url: string) => {
	const createSocket = () => {
		const socket = new WebSocket(url);

		set(socketAtom, socket);

		socket.onopen = () => {
			set(statusAtom, "connected");
		};

		socket.onmessage = (event: MessageEvent) => {
			const parsedData = AgentEvent.safeParse(JSON.parse(event.data));

			if (parsedData.success) {
				set(handleNewFeedEventAtom, parsedData.data);
			} else {
				console.log("Parsed event:", parsedData.error);
				console.log(JSON.parse(event.data));
				console.log(event);
			}
		};

		socket.onclose = () => {
			set(statusAtom, "disconnected");
			// Don't set socketAtom to null here
			// Instead try to reconnect after a delay
			setTimeout(() => createSocket(), 1000);
		};

		socket.onerror = (error) => {
			console.error("WebSocket error:", error);
			set(statusAtom, "disconnected");
		};

		return socket;
	};

	const socket = createSocket();

	// Cleanup on unmount - return a function that closes the socket
	return () => {
		if (socket) {
			// Remove the onclose handler to prevent reconnection attempts when intentionally closing
			socket.onclose = null;
			socket.close();
		}
	};
});

export const sendMessageAtom = atom(null, (get, _set, message: any) => {
	console.log("Sending message:", message);
	const socket = get(socketAtom);
	console.log(socket);
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(message));
	} else {
		console.error("WebSocket is not open. Cannot send message.");
	}
});

// Why does the sendMessageAtom sees the websocket as null even though i see it connected

// I set the socket in initializeSocketAtom set(socketAtom, socket);

// However in sendMessageAtom the get(socketAtom) returns null.

// In the usefeefct though we call initializeSocketAtom, and sendMessageAtom is used way later when someone click as a button

// export const sendMessageAtom = atom(null, (get, set, message: any) => {
// 	console.log("Sending message:", message);
// 	const socket = get(socketAtom);
// 	console.log(socket);
// 	if (socket && socket.readyState === WebSocket.OPEN) {
// 		socket.send(JSON.stringify(message));
// 	} else {
// 		console.error("WebSocket is not open. Cannot send message.");
// 	}
// });
