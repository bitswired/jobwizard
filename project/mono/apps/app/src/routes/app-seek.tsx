import { FeedDisplayMinimal } from "@app/components/seek";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@app/components/ui/sheet";
import NumberFlow from "@number-flow/react";
import { z } from "zod";

import {
	consumptionSummaryAtom,
	feedAtom,
	handleNewFeedEventAtom,
	initializeSocketAtom,
	mainAgentStatusAtom,
	messageContainerRefAtom,
	offersAtom,
	routerOutputAtom,
	sendMessageAtom,
	statusAtom,
	userInteractionAtom,
} from "@app/atoms/seek";

import {
	type UserInteractionFileWithUidInput,
	UserInteractionFileWithUidInputSchema,
	UserInteractionInputSchema,
	UserInteractionSelectInputSchema,
} from "@agent/agents/schemas";
import { statusMessagesAtom } from "@app/atoms/seek/feed";
import { Button } from "@app/components/ui/button";
import { Checkbox } from "@app/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@app/components/ui/dialog";
import { Textarea } from "@app/components/ui/textarea";
import { SETTINGS } from "@app/settings";
import { createFileRoute } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ArrowUp } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { type ReactNode, useEffect, useRef } from "react";
import { BeatLoader } from "react-spinners";

export const Route = createFileRoute("/app/seek")({
	component: SeekPage,
});

function SeekPage() {
	const ref = useRef<HTMLDivElement>(null);
	const feed = useAtomValue(feedAtom);
	const handleNewFeedEvent = useSetAtom(handleNewFeedEventAtom);
	const initializeSocket = useSetAtom(initializeSocketAtom);
	const sendMessage = useSetAtom(sendMessageAtom);
	const mainAgentStatus = useAtomValue(mainAgentStatusAtom);
	const setContainerRef = useSetAtom(messageContainerRefAtom);

	useEffect(() => {
		setContainerRef(ref);

		const close = initializeSocket(SETTINGS.API.WEBSOCKET_URL);
		return () => {
			close();
		};
	}, [initializeSocket, setContainerRef]);

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const message = formData.get("user-message") as string;
		sendMessage({
			type: "user.query",
			message,
		});

		handleNewFeedEvent({
			event: "user.query",
			data: {
				query: message,
			},
		});
		e.currentTarget.reset();
	};

	return (
		<div className="flex flex-col gap-4 w-full h-full">
			<ConsumptionDisplay />

			<UserInteractionDialog />

			<div className="overflow-y-auto h-full w-full" ref={ref}>
				<div className="flex flex-col gap-2 w-full max-w-[800px] mx-auto p-1 overflow-hidden">
					{mainAgentStatus === "idle" && (
						<div className="m-auto">
							<Tutorial />
						</div>
					)}
					{mainAgentStatus !== "idle" && <FeedDisplayMinimal feed={feed} />}
					<StatusDisplay />
					{mainAgentStatus === "done" && <ResultDisplay />}
				</div>
			</div>

			{mainAgentStatus === "idle" && (
				<div className="mt-auto ">
					<form
						className="relative w-full max-w-[700px] mx-auto"
						onSubmit={onSubmit}
					>
						<Textarea name="user-message" className="w-full h-[100px]" />
						<Button
							type="submit"
							className="absolute bottom-2 right-2"
							size="icon"
						>
							<ArrowUp />
						</Button>
					</form>
				</div>
			)}
		</div>
	);
}

function ResultDisplay() {
	const letters = useAtomValue(routerOutputAtom);
	const offers = useAtomValue(offersAtom);

	const res = letters.map((letter) => {
		const offer = offers.at(letter.id);
		if (!offer) {
			throw new Error("Invalid offer idx");
		}
		return {
			offer,
			letter,
		};
	});

	return (
		<div className="flex flex-col gap-4 w-full text-[1rem]">
			{res.map((x) => (
				<div
					className="border rounded-md p-8 space-y-2 w-full"
					key={JSON.stringify(x)}
				>
					<div className="font-bold">{x.offer.title}</div>
					<div>
						<a
							href={x.offer.url}
							className="underline line-clamp-1 text-[0.8rem]"
						>
							{x.offer.url}
						</a>
					</div>
					<div className="text-[0.75rem] text-slate-500">
						{x.offer.description}
					</div>
					<div className="mt-8">
						<div className="font-semi-bold">Cover Letter</div>
						<div className="text-sm prose prose-sm text-[0.8rem]">
							<Markdown>{x.letter.content}</Markdown>
						</div>
					</div>
				</div>
			))}
			<Button onClick={() => window.location.reload()}>Seek Jobs Again</Button>
		</div>
	);
}

function WebsocketStatusDisplay() {
	const connectionStatus = useAtomValue(statusAtom);
	return (
		<div className="flex items-center gap-2">
			{connectionStatus === "connected" && (
				<>
					agents connected:
					<div className="size-[16px] bg-emerald-500 rounded-full animate-pulse" />
				</>
			)}
			{connectionStatus === "disconnected" && (
				<>
					disconnected
					<div className="size-[16px] bg-red-500 rounded-full " />
				</>
			)}
		</div>
	);
}

export function AssetsDisplay() {
	const offers = useAtomValue(offersAtom);
	const coverLetters = useAtomValue(routerOutputAtom);

	const numberOfAssets = offers.length;
	+coverLetters.length;

	if (numberOfAssets === 0) {
		return null;
	}

	return (
		<Sheet>
			<SheetTrigger>
				<div className="relative cursor-pointer">
					Assets
					<div className="absolute -top-3 -right-3 size-[24px] text-white bg-red-500 rounded-full text-[12px] p-1 flex justify-center items-center scale-75">
						<div>{numberOfAssets}</div>
					</div>
				</div>
			</SheetTrigger>
			<SheetContent className="min-w-[800px] p-8 overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Assets Created By The Aents</SheetTitle>
					<SheetDescription>
						This is the list of assets created by the agents, you will find job
						offers as well as cover letters generated by the agents as they are
						working on your query.
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-4 ">
					<div className="text-[1rem]">Job Offers</div>
					<div className="h-[500px] overflow-y-auto flex flex-col gap-4 p-4 bg-slate-100 rounded-md">
						{offers.map((offer) => (
							<div
								key={JSON.stringify(offer)}
								className="p-4 rounded-lg border bg-white"
							>
								<div className="font-semibold">{offer.title}</div>
								<a href={offer.url} className="underline line-clamp-1 text-sm">
									{offer.url}
								</a>
								<div className="text-sm line-clamp-3 mt-4 opacity-70">
									h{offer.description}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-4 ">
					<div className="text-[1rem]">Cover Letters</div>
					<div className="h-[500px] overflow-y-auto flex flex-col gap-4 ">
						{coverLetters.map((letter) => (
							<div
								key={JSON.stringify(letter)}
								className="p-4 rounded-lg border "
							>
								<div className="font-semibold">Cover letter {letter.id}</div>
								<div className="text-sm line-clamp-3 mt-4 opacity-70">
									<Markdown>{letter.content}</Markdown>
								</div>
							</div>
						))}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

function ConsumptionDisplay() {
	const total = useAtomValue(consumptionSummaryAtom);
	const mainAgentStatus = useAtomValue(mainAgentStatusAtom);
	const money =
		(0.4 * total.inputTokens) / 1_000_000 +
		(1.6 * total.outputTokens) / 1_000_000;

	return (
		<div className="text-xs text-gray-500 flex gap-4 shadow-md p-2 rounded-md items-center flex-wrap justify-between">
			{mainAgentStatus !== "idle" && (
				<>
					<div>Model: GPT 4.1 Mini</div>
					{/* <div>
						Input tokens: <NumberFlow value={total.inputTokens} />
					</div>
					<div>
						Output tokens: <NumberFlow value={total.outputTokens} />
					</div> */}
					<div>
						Total tokens: <NumberFlow value={total.totalTokens} />
					</div>
					<div>
						Cost: $<NumberFlow value={money} />
					</div>
				</>
			)}
			<WebsocketStatusDisplay />
		</div>
	);
}

function UserInteractionDialog() {
	const [userInteractionQuery, setUserInteractionQuery] =
		useAtom(userInteractionAtom);

	const sendMessage = useSetAtom(sendMessageAtom);

	const parsedQuery = userInteractionQuery
		? z
				.union([
					UserInteractionFileWithUidInputSchema,
					UserInteractionSelectInputSchema,
					UserInteractionInputSchema,
				])
				.parse(JSON.parse(userInteractionQuery))
		: null;

	if (!parsedQuery) {
		return null;
	}

	function hasChoices(
		query: any,
	): query is { prompt: string; choices: { value: string; label: string }[] } {
		return "choices" in query;
	}

	function hasFile(query: any): query is UserInteractionFileWithUidInput {
		return "mime" in query;
	}

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		// For checkbox array values
		if (hasChoices(parsedQuery)) {
			const selectedChoices = formData
				.getAll("user-choices[]")
				.map((value) => String(value));

			console.log("Selected choices:", selectedChoices);
			sendMessage({
				type: "user.interaction.response",
				message: JSON.stringify(selectedChoices),
			});
		} else if (hasFile(parsedQuery)) {
			const userFile = formData.get("user-file");
			if (!userFile) {
				throw new Error("No file");
			}
			fetch(parsedQuery.url, {
				method: "PUT",
				body: userFile,
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error(`Failed to upload file: ${response.statusText}`);
					}
					console.log("File uploaded successfully");
					sendMessage({
						type: "user.interaction.response",
						message: parsedQuery.uid,
					});
				})
				.catch((error) => {
					console.error("Error uploading file:", error);
					// Optionally, handle the error (e.g., show an error message to the user)
				});
		} else {
			const message = formData.get("user-message") as string;

			console.log("User message:", message);
			sendMessage({
				type: "user.interaction.response",
				message,
			});
		}

		setUserInteractionQuery(null);
	};

	let form: ReactNode = undefined;
	if (hasChoices(parsedQuery)) {
		form = (
			<form className="relative" onSubmit={onSubmit}>
				{parsedQuery.choices.map((choice) => (
					<div key={choice.value} className="flex gap-4 items-center">
						<Checkbox
							id={choice.value}
							name="user-choices[]"
							className="size-5"
							value={choice.value}
						/>
						<label htmlFor={choice.value}>{choice.label}</label>
					</div>
				))}
				<Button type="submit" className="absolute bottom-2 right-2" size="icon">
					<ArrowUp />
				</Button>
			</form>
		);
	} else if (hasFile(parsedQuery)) {
		form = (
			<form className="relative" onSubmit={onSubmit}>
				<div className="rounded-md flex gap-2 items-center p-1 px-4 w-full">
					<input
						id="file"
						name="user-file"
						placeholder="Upload your resume as a PDF"
						type="file"
						accept={parsedQuery.mime}
						className="hidden"
					/>
					<label
						htmlFor="file"
						className="cursor-pointer hover:bg-slate-200 p-4 flex border rounded-md"
					>
						Click to upload then submit
					</label>
				</div>

				<Button type="submit" className="absolute bottom-2 right-2">
					Submit <ArrowUp />
				</Button>
			</form>
		);
	} else {
		form = (
			<form className="relative" onSubmit={onSubmit}>
				<Textarea name="user-message" className="w-full h-[100px]" />
				<Button type="submit" className="absolute bottom-2 right-2" size="icon">
					<ArrowUp />
				</Button>
			</form>
		);
	}

	return (
		<Dialog open={!!parsedQuery}>
			<DialogContent className="max-w-[90vw] text-[0.9rem]">
				<DialogHeader>
					<DialogTitle className="p-1 text-left">
						JobWizard agents need your input
					</DialogTitle>
				</DialogHeader>

				<div className="prose text-[0.9rem]">
					<Markdown>{parsedQuery.prompt}</Markdown>
				</div>
				{form}
			</DialogContent>
		</Dialog>
	);
}

function Tutorial() {
	const description = `
Our multi agent system is designs to help you find your dream job.

The router agent use different tools and agents to complete the tedious search for you and will create a personalized cover letter tailored specifcally for each job offer.

1. You ask a question like: "Find me AI Engineers jobs in Geneva"
2. The router agent first use the offer finder agent to find job offers that match your query
3. Then it will ask you to select the offers you are most interested in
5. The offer enricher agent will then scrape the job offer page, company page, and company linkedin profile to extract important information to create the cover letter
6. For each job offer, the router agent will give you a cover letter that you can use to apply for the job
`;

	return (
		<div className="space-y-8">
			<div className="text-center text-[1.5rem] font-bold">
				Let our AI agents find your dream job for you!
			</div>

			<div
				id="description prose"
				className="prose mx-auto bg-slate-100 p-4 rounded-md shadow-md text-[0.8rem]"
			>
				<Markdown>{description}</Markdown>
			</div>
			<div className="grid dm:grid-cols-1  md:grid-cols-2 gap-8 justify-items-stretch">
				<ExamplePromptButton>AI Engineers jobs in Geneva</ExamplePromptButton>

				<ExamplePromptButton>Remote jobs in AI</ExamplePromptButton>

				<ExamplePromptButton>
					Software eng jobs in Switzerland
				</ExamplePromptButton>

				<ExamplePromptButton>
					Data engineering jobs in France
				</ExamplePromptButton>
			</div>
		</div>
	);
}

function ExamplePromptButton({
	children,
}: {
	children: ReactNode;
}) {
	const handleNewFeedEvent = useSetAtom(handleNewFeedEventAtom);
	const sendMessage = useSetAtom(sendMessageAtom);

	const onClick = () => {
		handleNewFeedEvent({
			event: "user.query",
			data: {
				query: children as string,
			},
		});
		sendMessage({
			type: "user.query",
			message: children as string,
		});
	};

	return (
		<button type="button" className="cursor-pointer" onClick={onClick}>
			<div className="p-4 rounded-md bg-slate-100 shadow-md text-[0.8rem] hover:bg-slate-300">
				{children}
			</div>
		</button>
	);
}

function StatusDisplay() {
	const status = useAtomValue(mainAgentStatusAtom);
	const statusMessages = useAtomValue(statusMessagesAtom);

	switch (status) {
		case "running":
			return (
				<div className="flex items-center gap-2 my-8 pl-6 animate-pulse text-[0.8rem] flex-wrap italic">
					JobWizard running: {statusMessages.at(-1)}
					<BeatLoader size={8} />
				</div>
			);
		case "idle":
			return null;
		case "done":
			return null;
	}
}
