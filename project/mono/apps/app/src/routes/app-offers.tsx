import { db } from "@app/lib/db";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import Markdown from "markdown-to-jsx";

export const Route = createFileRoute("/app/offers")({
	component: PageOffers,
});

function PageOffers() {
	const offers = useLiveQuery(() => db.offers.toArray());

	return (
		<div className="overflow-y-auto h-full p-8">
			<div className="text-center text-3xl font-bold">Your saved offers</div>

			<br />

			<div className="flex flex-col gap-4 max-w-[800px] mx-auto">
				{offers?.map((offer) => (
					<div
						key={JSON.stringify(offer)}
						className="p-4 rounded-lg border bg-white"
					>
						<div className="font-semibold">{offer.title}</div>
						<a href={offer.url} className="underline line-clamp-1 text-sm">
							{offer.url}
						</a>
						<div className="text-sm line-clamp mt-4 opacity-70">
							{offer.description}
						</div>
						<br />
						<Markdown>{offer.letter}</Markdown>
					</div>
				))}
			</div>
		</div>
	);
}
