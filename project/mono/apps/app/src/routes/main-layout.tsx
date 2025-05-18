import { $api, queryClient } from "@app/lib/data";
import {
	Link,
	Outlet,
	createFileRoute,
	redirect,
} from "@tanstack/react-router";
import { Code, Gem, Home } from "lucide-react";

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
			<aside className="h-screen w-max shrink-0 min-[1000px]:hidden hidden">
				<div className="h-full w-full bg-black rounded-lg text-white p-4 py-6">
					<div className="size-[30px]">
						<img
							src="https://cdn-icons-png.flaticon.com/512/9631/9631363.png"
							alt="Logo"
							className="w-full h-full"
						/>
					</div>

					<br />

					<nav className="flex flex-col gap-4 mt-4 w-full">
						<Link to="/" className="text-white flex gap-2 items-center">
							<Home size={22} />
						</Link>
						<Link to="/app/seek" className="text-white flex gap-2 items-center">
							<Gem size={22} />
						</Link>
					</nav>
				</div>
			</aside>

			<aside className="h-screen w-max p-2 shrink-0 max-[1000px]:hidden">
				<div className="h-full w-full bg-black rounded-lg text-white p-4">
					<div className="flex gap-4 items-center">
						<div className="size-[30px]">
							<img
								src="https://cdn-icons-png.flaticon.com/512/9631/9631363.png"
								alt="Logo"
								className="w-full h-full"
							/>
						</div>
						<div className="font-bold">JobWizard</div>
					</div>

					<br />
					<div>{me.data?.email}</div>
					<br />

					<nav className="flex flex-col gap-4 mt-4 w-full">
						<Link to="/" className="text-white flex gap-2 items-center">
							<Home size={16} /> Home
						</Link>
						<Link to="/app/seek" className="text-white flex gap-2 items-center">
							<Gem size={16} />
							Find Your Dream Job
						</Link>
						<Link
							to="/app/readme"
							className="text-white flex gap-2 items-center"
						>
							<Code size={16} />
							Readme
						</Link>
					</nav>
				</div>
			</aside>

			<main className="p-2 md:p-6 w-full h-full bg-black">
				<main className="w-full h-full bg-white rounded-md p-2">
					<Outlet />
				</main>
			</main>
		</div>
	);
}
