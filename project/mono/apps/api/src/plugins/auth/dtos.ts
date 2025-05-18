import { table } from "@api/db/schema";
import { spread } from "@api/db/utils";
import { type Static, t } from "elysia";

const user = spread(table.userTable, "insert");

export const SignupUsernameDto = t.Object({
	email: t.String(),
	password: t.String(),
});
export type SignupUsernameDto = Static<typeof SignupUsernameDto>;

export const LoginUsernameDto = SignupUsernameDto;
export type LoginUsernameDto = Static<typeof LoginUsernameDto>;

const { passwordHash, ...userWithoutPassword } = user;
export const UserDto = t.Object({
	...userWithoutPassword,
});
export type UserDto = Static<typeof UserDto>;
