// routes.ts
import { index, rootRoute, route } from "@tanstack/virtual-file-routes";

export const routes = rootRoute("root.tsx", [
	index("home.tsx"),
	route("/login", "login.tsx"),
	route("/signup", "signup.tsx"),
	route("/app", "main-layout.tsx", [
		index("app-index.tsx"),
		route("/seek", "app-seek.tsx"),
		route("/offers", "app-offers.tsx"),
	]),
]);
