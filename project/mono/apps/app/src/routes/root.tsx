import { Toaster } from "@app/components/ui/sonner";
import { queryClient } from "@app/lib/data";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<Outlet />
			<Toaster />
			<TanStackRouterDevtools />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	),
});
