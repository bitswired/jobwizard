import { Elysia, status } from "elysia";
import {
	invalidateAllSessions,
	usernameLogin,
	usernameSignup,
	validateSessionToken,
} from "./actions";
import { LoginUsernameDto, SignupUsernameDto, UserDto } from "./dtos";

export const authService = new Elysia({ name: "user/service" }).macro({
	isLoggedIn: {
		async resolve({ cookie: { token } }) {
			if (!token.value) {
				return status(401, { message: "Unauthorized" });
			}

			const { user } = await validateSessionToken(token.value);

			return { user };
		},
	},
});

export const auth = new Elysia({
	prefix: "/auth",
})
	.use(authService)
	.group("/username", (app) =>
		app
			.post(
				"/login",
				async ({ body, cookie: { token } }) => {
					const res = await usernameLogin(body);
					token.set({
						httpOnly: true,
						value: res.token,
						expires: res.session.expiresAt,
						sameSite: "lax",
						secure: true,
					});
					return status(200, { message: "Logged in successfully" });
				},
				{
					body: LoginUsernameDto,
				},
			)
			.post(
				"/signup",
				async ({ body }) => {
					await usernameSignup(body);
					return status(200, { message: "Signed up successfully" });
				},
				{
					body: SignupUsernameDto,
				},
			),
	)
	.guard({ isLoggedIn: true })
	.get(
		"/me",
		({ user }) => {
			return user;
		},
		{
			response: UserDto,
		},
	)
	.post("/logout", async ({ user }) => {
		await invalidateAllSessions(user.id);
		return status(200, { message: "Logged out successfully" });
	});
