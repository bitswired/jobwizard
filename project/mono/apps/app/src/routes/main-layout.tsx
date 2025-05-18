import { $api, queryClient } from "@app/lib/data";
import {
	Link,
	Outlet,
	createFileRoute,
	redirect,
} from "@tanstack/react-router";
import { Gem, Home, Workflow } from "lucide-react";

export const Route = createFileRoute("/app")({
	component: RouteComponent,

	beforeLoad: async ({ location }) => {
		if (
			location.pathname.includes("login") ||
			location.pathname.includes("signup")
		) {
			return;
		}

		try {
			const meQuery = $api.queryOptions("get", "/auth/me");
			await queryClient.fetchQuery(meQuery);
		} catch (error) {
			return redirect({ to: "/login" });
		}
	},
});

function RouteComponent() {
	const me = $api.useQuery("get", "/auth/me");
	return (
		<div className="flex h-screen bg-black">
			<aside className="h-screen w-max shrink-0 min-[1000px]:hidden">
				<div className="h-full w-full bg-black rounded-lg text-white p-4 py-6">
					<div className="mx-auto w-max">AI</div>

					<br />

					<nav className="flex flex-col gap-4 mt-4 w-full">
						<Link to="/app" className="text-white flex gap-2 items-center">
							<Home size={22} />
						</Link>
						<Link to="/app/seek" className="text-white flex gap-2 items-center">
							<Gem size={22} />
						</Link>
						<Link
							to="/app/offers"
							className="text-white flex gap-2 items-center"
						>
							<Workflow size={22} />
						</Link>
					</nav>
				</div>
			</aside>

			<aside className="h-screen w-max p-2 shrink-0 max-[1000px]:hidden">
				<div className="h-full w-full bg-black rounded-lg text-white p-4">
					<div>AI Job Seeking</div>

					<br />
					<div>{me.data?.email}</div>
					<br />

					<nav className="flex flex-col gap-4 mt-4 w-full">
						<Link to="/app" className="text-white flex gap-2 items-center">
							<Home size={16} /> Home
						</Link>
						<Link to="/app/seek" className="text-white flex gap-2 items-center">
							<Gem size={16} />
							Find Your Dream Job
						</Link>
						<Link
							to="/app/offers"
							className="text-white flex gap-2 items-center"
						>
							<Workflow size={16} /> Offers
						</Link>
					</nav>
				</div>
			</aside>

			<main className="py-6 pr-6 w-full h-full bg-black">
				<main className="w-full h-full bg-white rounded-md p-4 py-8">
					<Outlet />
				</main>
			</main>
		</div>
	);
}
