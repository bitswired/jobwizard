// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		TanStackRouterVite({
			target: "react",
			autoCodeSplitting: true,
			virtualRouteConfig: "./src/routes.ts",
		}),
		tailwindcss(),
		tsconfigPaths(),
		react(),
	],
});
