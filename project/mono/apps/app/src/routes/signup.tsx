import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { $api } from "@app/lib/data";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
	component: SignupPage,
});

function SignupPage() {
	const naigate = useNavigate();
	const signup = $api.useMutation("post", "/auth/username/signup", {
		onSuccess: () => {
			toast.success("Signup successful");
			naigate({ to: "/login" });
		},
		onError: (error) => {
			toast.error(`Signup failed: ${JSON.stringify(error)}`);
		},
	});

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email = formData.get("email");
		const password = formData.get("password");

		if (typeof email !== "string" || typeof password !== "string") {
			return;
		}

		signup.mutate({
			body: {
				email,
				password,
			},
		});
	};

	return (
		<div className="p-2 flex justify-center mt-32">
			<form
				className="flex flex-col gap-4 max-w-xl w-full"
				onSubmit={handleSubmit}
			>
				<h1 className="text-2xl font-bold">Signup</h1>
				<Input name="email" type="email" placeholder="Email" />
				<Input name="password" type="password" placeholder="Password" />
				<Button type="submit">Signup</Button>
			</form>
		</div>
	);
}
