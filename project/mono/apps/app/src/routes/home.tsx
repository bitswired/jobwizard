import { Button } from "@app/components/ui/button";
import { $api } from "@app/lib/data";
import { Link, createFileRoute } from "@tanstack/react-router";
import imgFull from "../../public/full.jpeg";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const me = $api.useQuery("get", "/auth/me");

	return (
		<>
			<div className="h-[60px] fixed top-0 left-0 w-full bg-slate-200 flex justify-between items-center p-4">
				<div>AI Job Seeker</div>

				{!me.data?.email && (
					<div className="flex gap-2">
						<Button variant="ghost" size="sm">
							<Link to="/login">Login</Link>
						</Button>
						<Button size="sm">
							<Link to="/signup">Signup</Link>
						</Button>
					</div>
				)}

				{me.data?.email && (
					<Button size="sm">
						<Link to="/app/seek">Find Jobs</Link>
					</Button>
				)}
			</div>
			<div className="bg-slate-100 w-full min-h-screen mt-[60px]">
				<br />
				<br />
				<br />
				<h1 className="text-center text-3xl font-bold">Your AI Job Seeker</h1>
				<div className="w-full max-w-[1200px] p-8 mx-auto rounded-md">
					<img
						src={imgFull}
						alt="Logo"
						className="h-full rounded-md shadow-lg"
					/>
				</div>
			</div>
		</>
	);
}
