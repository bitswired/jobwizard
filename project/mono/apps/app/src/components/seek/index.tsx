import {
	type AgentElement,
	type FeedElement,
	type ToolElement,
	mainAgentStatusAtom,
	statusMessagesAtom,
} from "@app/atoms/seek/feed";
import { AnimatePresence, motion } from "motion/react";

import { BeatLoader } from "react-spinners";

import {
	OffersFinderOutputSchema,
	RouterAgentOutputSchema,
} from "@agent/agents/schemas";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@app/components/ui/collapsible";
import { useAtomValue } from "jotai";
import { ChevronDown, ChevronUp } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { ClockLoader, PuffLoader } from "react-spinners";
import brightDataLogo from "../../../public/bright-data-logo.png";

export function FeedDisplay({
	feed,
}: {
	feed: FeedElement;
}) {
	switch (feed.type) {
		case "user.message":
			return <div className="">{feed.state.query}</div>;
		case "root": {
			return (
				<div className="flex flex-col gap-2">
					{feed.children.map((child, index) => (
						<FeedDisplay key={index} feed={child} />
					))}
				</div>
			);
		}
		case "agent": {
			return (
				<div className="border-2 p-4 rounded-md w-full">
					<FeedAgentElement feed={feed} />
				</div>
			);
		}

		case "tool": {
			return (
				<div className="border-2 p-4 rounded-md w-full">
					<FeedToolElement feed={feed} />
				</div>
			);
		}
	}
}

function AgentResultDisplay({ feed }: { feed: AgentElement }) {
	if (!feed.state.result) {
		return null;
	}
	switch (feed.state.name) {
		case "agent-offers-finder": {
			const result = OffersFinderOutputSchema.parse(feed.state.result);
			return (
				<div className="text-base  space-y-4">
					{result.offers.map((item: any, index: number) => (
						<div
							key={index}
							className="rounded-lg p-4 shadow-lg flex flex-col gap-2"
						>
							<div className="flex gap-2">
								<h1>{item.title}</h1>-<p>{item.company}</p>
							</div>

							<a href={item.url} className="underline">
								{" "}
								{item.url.slice(0, 30)}...
							</a>

							<p>{item.description}</p>
						</div>
					))}
				</div>
			);
		}
		case "agent-router": {
			const result = RouterAgentOutputSchema.parse(feed.state.result);
			return (
				<div className="text-base  space-y-4">
					{result.letters.map((item, index: number) => (
						<div key={index} className="prose border p-4 rounded-md">
							<Markdown>{item.content}</Markdown>
						</div>
					))}
				</div>
			);
		}

		default:
			return <div>{JSON.stringify(feed.state.result)}</div>;
	}
}

export function FeedAgentElement({ feed }: { feed: AgentElement }) {
	return (
		<div className="flex flex-col gap-2">
			<Collapsible defaultOpen={true} className="">
				<CollapsibleTrigger className="group cursor-pointer">
					<div
						className="flex items-center gap-2 data-[done=false]:animate-pulse data-[done=true]:[&>.load]:hidden data-[done=false]:[&>.tick]:hidden"
						data-done={!!feed.state.result}
					>
						<span className="load">
							<ClockLoader
								size={14}
								className="peer-[[data-done=true]]:hidden"
							/>
						</span>
						<span className="tick text-xs">✅</span>
						<ChevronUp
							size={14}
							className="text-gray-500 group-[[data-state=closed]]:hidden"
						/>
						<ChevronDown
							size={14}
							className="text-gray-500 group-[[data-state=open]]:hidden"
						/>
						<div className="font-bold">{feed.state.name}</div>
						{feed.state.args && (
							<div className="text-xs">
								{JSON.stringify(feed.state.args)?.slice(0, 100)}
							</div>
						)}
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="flex flex-col gap-4 mt-4">
						{feed.children.map((child, index) => (
							<FeedDisplay key={index} feed={child} />
						))}
					</div>
				</CollapsibleContent>
			</Collapsible>

			<Collapsible
				defaultOpen={true}
				className="data-[done=false]:hidden"
				data-done={!!feed.state.result}
			>
				<CollapsibleTrigger className="group cursor-pointer">
					<div
						className="flex items-center gap-2 data-[done=false]:animate-pulse"
						data-done={!!feed.state.result}
					>
						<ChevronUp
							size={14}
							className="text-gray-500 group-[[data-state=closed]]:hidden"
						/>
						<ChevronDown
							size={14}
							className="text-gray-500 group-[[data-state=open]]:hidden"
						/>
						<div className="font-bold">Result</div>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<AgentResultDisplay feed={feed} />
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

export function FeedToolElement({
	feed,
}: {
	feed: ToolElement;
}) {
	return (
		<div className="flex flex-col gap-2">
			<Collapsible defaultOpen={false} className="">
				<CollapsibleTrigger className="group cursor-pointer">
					<div
						className="flex items-center gap-2 data-[done=false]:animate-pulse data-[done=true]:[&>.load]:hidden data-[done=false]:[&>.tick]:hidden"
						data-done={!!feed.state.result}
					>
						<div>
							<span className="load">
								<PuffLoader
									size={14}
									className="peer-[[data-done=true]]:hidden"
								/>
							</span>
							<span className="tick text-xs">✅</span>
						</div>

						<ChevronUp
							size={14}
							className="text-gray-500 group-[[data-state=closed]]:hidden"
						/>
						<ChevronDown
							size={14}
							className="text-gray-500 group-[[data-state=open]]:hidden"
						/>
						<div className="font-bold">{feed.state.name}</div>
						<div className="text-xs">
							{JSON.stringify(feed.state.args)?.slice(0, 100)}
						</div>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					{feed.state.result && (
						<div className="text-xs text-gray-500 prose">
							{feed.state.name === "search_engine" && (
								<Markdown>{feed.state.result}</Markdown>
							)}
							{feed.state.name === "scrape_as_markdown" && (
								<Markdown>{feed.state.result}</Markdown>
							)}
							{feed.state.name !== "search_engine" &&
								feed.state.name !== "scrape_as_markdown" && (
									<div>{JSON.stringify(feed.state.result)}</div>
								)}
						</div>
					)}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

export function FeedAgentElementMinimal({ feed }: { feed: AgentElement }) {
	return (
		<div className="flex flex-col gap-2">
			<Collapsible defaultOpen={true} className="">
				<CollapsibleTrigger className="group cursor-pointer">
					<div
						className="flex justify-start items-center gap-2 data-[done=false]:animate-pulse data-[done=true]:[&>.load]:hidden data-[done=false]:[&>.tick]:hidden"
						data-done={!!feed.state.result}
					>
						<span className="load">
							<ClockLoader
								size={14}
								className="peer-[[data-done=true]]:hidden"
							/>
						</span>
						<span className="tick text-[0.6rem]">✅</span>
						<ChevronUp
							size={14}
							className="text-gray-500 group-[[data-state=closed]]:hidden"
						/>
						<ChevronDown
							size={14}
							className="text-gray-500 group-[[data-state=open]]:hidden"
						/>
						<div className="font-bold shrink-0">{feed.state.name}</div>
						{feed.state.args && (
							<div className="text-[0.6rem] line-clamp-1 text-left break-all">
								{JSON.stringify(feed.state.args)?.slice(0, 100)}
							</div>
						)}
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="flex flex-col gap-4 mt-4 border-l-2">
						{feed.children.map((child, index) => (
							<FeedDisplayMinimal key={index} feed={child} />
						))}
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

export function FeedToolElementMinimal({
	feed,
}: {
	feed: ToolElement;
}) {
	return (
		<div className="flex flex-col gap-2 overflow-hidden">
			<div
				className="flex items-center gap-2 data-[done=false]:animate-pulse data-[done=true]:[&>.load]:hidden data-[done=false]:[&>.tick]:hidden"
				data-done={!!feed.state.result}
			>
				<span className="load">
					<PuffLoader size={14} className="peer-[[data-done=true]]:hidden" />
				</span>
				<span className="tick text-[0.6rem]">✅</span>
				{[
					"scrape_as_markdown",
					"search_engine",
					"web_data_linkedin_company_profile",
				].includes(feed.state.name) && (
					<div className="size-[15px] shrink-0">
						<img
							src={brightDataLogo}
							alt="logo"
							className="w-full h-full rounded-full"
						/>
					</div>
				)}
				<div className="font-bold shrink-0 max-w-full">{feed.state.name}</div>
				<div className="text-[0.6rem] line-clamp-1 w-max-[10ch] break-all">
					{JSON.stringify(feed.state.args)?.slice(0, 100)}
				</div>
			</div>
		</div>
	);
}

export function AnimatedText({
	text,
	isLast,
}: { text: string; isLast: boolean }) {
	const [idx, setIdx] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setIdx((prev) => {
				if (prev < text.length) {
					return prev + 1;
				}
				clearInterval(timer);
				return prev;
			});
		}, 50); // Adjust speed here (ms per character)

		return () => clearInterval(timer);
	}, [text.length, setIdx]);

	return (
		<div className="flex gap-2 items-center flex-wrap">
			<div className="data-[isLast=true]:animate-pulse" data-isLast={isLast}>
				<AnimatePresence>
					{text
						.slice(0, idx)
						.split("")
						.filter((x) => !!x)
						.map((char, index) => (
							<motion.span
								key={`${char}-${index}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }} // Adjust opacity transition speed
								style={{ display: "inline-block", whiteSpace: "pre" }}
							>
								{char}
							</motion.span>
						))}
					<span>{!isLast && "."}</span>
					{isLast && idx === text.length && (
						<span className="ml-2">
							<BeatLoader size={8} />
						</span>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

function StatusDisplay() {
	const statusMessages = useAtomValue(statusMessagesAtom);
	const mainAgentStatus = useAtomValue(mainAgentStatusAtom);
	return (
		<div className="italic my-6 space-y-2">
			{statusMessages.map((text, i) => (
				<AnimatedText
					text={"- " + text}
					key={text}
					isLast={i === statusMessages.length - 1 && mainAgentStatus !== "done"}
				/>
			))}
		</div>
	);
}

export function FeedDisplayMinimal({
	feed,
}: {
	feed: FeedElement;
}) {
	switch (feed.type) {
		case "user.message":
			return (
				<div className="w-max ml-auto bg-slate-100 p-4 rounded-xl">
					{feed.state.query}
				</div>
			);
		case "root": {
			return (
				<div className="flex flex-col gap-2 p-1 rounded-md mx-auto text-[0.8rem] w-full overflow-hidden">
					{feed.children.map((child, index) => (
						<FeedDisplayMinimal key={index} feed={child} />
					))}
				</div>
			);
		}
		case "agent": {
			if (feed.state.name === "agent-router") {
				return (
					<div className="pl-4 w-full bg-slate-50 p-4 rounded-md">
						<StatusDisplay />
						<FeedAgentElementMinimal feed={feed} />
					</div>
				);
			}

			return (
				<div className="pl-4 w-full">
					<FeedAgentElementMinimal feed={feed} />
				</div>
			);
		}

		case "tool": {
			return (
				<div className="pl-4 w-full">
					<FeedToolElementMinimal feed={feed} />
				</div>
			);
		}
	}
}
