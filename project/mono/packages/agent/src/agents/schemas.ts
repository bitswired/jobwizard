import { z } from "zod";

export const JobOfferSchema = z.object({
	title: z.string(),
	company: z.string(),
	description: z.string(),
	url: z.string(),
});
export type JobOffer = z.infer<typeof JobOfferSchema>;

export const EnrichedJobOfferSchema = z.object({
	offer: JobOfferSchema,
	additionnalInfo: z.string(),
});
export type EnrichedJobOffer = z.infer<typeof EnrichedJobOfferSchema>;

export const OffersFinderInputSchema = z.object({
	prompt: z.string(),
});
export type OffersFinderInput = z.infer<typeof OffersFinderInputSchema>;

export const OffersFinderOutputSchema = z.object({
	offers: z.array(JobOfferSchema),
});
export type OffersFinderOutput = z.infer<typeof OffersFinderOutputSchema>;

export const UserInteractionInputSchema = z.object({
	prompt: z.string(),
});
export type UserInteractionInput = z.infer<typeof UserInteractionInputSchema>;

export const UserInteractionSelectInputSchema = z.object({
	prompt: z.string(),
	choices: z.array(z.object({ label: z.string(), value: z.string() })),
});
export type UserInteractionSelectInput = z.infer<
	typeof UserInteractionSelectInputSchema
>;

export const OfferEnricherOutputSchema = EnrichedJobOfferSchema;
export type OfferEnricherOutput = z.infer<typeof OfferEnricherOutputSchema>;

export const PersonalizerInputSchema = z.object({
	enrichedOffers: z.array(EnrichedJobOfferSchema),
});
export type PersonalizerInput = z.infer<typeof PersonalizerInputSchema>;

export const PersonalizerOutputSchema = z.object({
	coverLetters: z.array(z.string()),
});
export type PersonalizerOutput = z.infer<typeof PersonalizerOutputSchema>;

export const RouterAgentOutputSchema = z.object({
	letters: z.array(
		z.object({
			id: z.number(),
			content: z.string(),
		}),
	),
});
export type RouterAgentOutput = z.infer<typeof RouterAgentOutputSchema>;
