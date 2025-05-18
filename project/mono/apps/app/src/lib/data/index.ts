import type { paths } from "@api-client/openapi";
import { SETTINGS } from "@app/settings";
import { QueryClient } from "@tanstack/react-query";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

export const client = createFetchClient<paths>({
	baseUrl: SETTINGS.API.BASE_URL,
	credentials: "include",
});

export const $api = createClient(client);

export const queryClient = new QueryClient();
