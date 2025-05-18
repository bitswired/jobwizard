import { db } from "@api/db";
import { sessionTable, userTable } from "@api/db/schema";
import { type InferInsertModel, type InferSelectModel, eq } from "drizzle-orm";
import { status } from "elysia";
import type { LoginUsernameDto, SignupUsernameDto } from "./dtos";

const hasher = new Bun.CryptoHasher("sha256");

export type SelectUser = InferSelectModel<typeof userTable>;
export type SelectSession = InferSelectModel<typeof sessionTable>;
export type CreateSession = InferInsertModel<typeof sessionTable>;

export function generateSessionToken(): string {
	return Bun.randomUUIDv7();
}

export async function createSession(
	token: string,
	userId: number,
): Promise<CreateSession> {
	// TODO
	const sessionId = hasher.update(token).digest("hex");

	const session: CreateSession = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	};

	await db.insert(sessionTable).values(session);

	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = hasher.update(token).digest("hex");

	const result = await db
		.select({ user: userTable, session: sessionTable })
		.from(sessionTable)
		.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
		.where(eq(sessionTable.id, sessionId));

	if (result.length < 1) {
		throw status(401, { message: "User not found" });
	}

	const { user, session } = result[0];

	if (!user) {
		throw status(401, { message: "User not found" });
	}

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
		throw status(401, { message: "Session expired" });
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessionTable)
			.set({
				expiresAt: session.expiresAt,
			})
			.where(eq(sessionTable.id, session.id));
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateAllSessions(userId: number): Promise<void> {
	await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export type SessionValidationResult =
	| { session: SelectSession; user: SelectUser }
	| { session: null; user: null };

export async function usernameSignup(data: SignupUsernameDto) {
	const hashedPassword = await Bun.password.hash(data.password, {
		algorithm: "argon2id", // "argon2id" | "argon2i" | "argon2d"
		memoryCost: 4, // memory usage in kibibytes
		timeCost: 3, // the number of iterations
	});

	await db.insert(userTable).values({
		email: data.email,
		passwordHash: hashedPassword,
	});
}

export async function usernameLoginVerify(email: string, password: string) {
	const user = (
		await db.select().from(userTable).where(eq(userTable.email, email)).limit(1)
	).at(0);

	if (!user) {
		throw status(401, { message: "User not found" });
	}

	if (!user.passwordHash) {
		throw status(400, { message: "User does not have a password" });
	}

	const isValid = await Bun.password.verify(password, user.passwordHash);

	if (!isValid) {
		throw status(401, { message: "Invalid password" });
	}

	return user;
}

export async function usernameLogin(data: LoginUsernameDto) {
	const user = await usernameLoginVerify(data.email, data.password);
	const token = generateSessionToken();
	const session = await createSession(token, user.id);
	return { user, token, session };
}
