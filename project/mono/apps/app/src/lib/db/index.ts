import Dexie, { type EntityTable } from "dexie";

interface Offer {
	id: number;
	title: string;
	company: string;
	description: string;
	url: string;
	letter: string;
}

const db = new Dexie("ai-job-seeking") as Dexie & {
	offers: EntityTable<
		Offer,
		"id" // primary key "id" (for the typings only)
	>;
};

// Schema declaration:
db.version(1).stores({
	offers: "++id, title, company, description, url", // primary key "id" (for the runtime!)
});

export { db };
export type { Offer };
