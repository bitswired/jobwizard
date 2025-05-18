Bun.serve({
	// routes: {
	// 	"/": spa,
	// },
	async fetch(req) {
		const url = new URL(req.url);
		let filePath = `.${url.pathname}`;

		// If the path ends with '/', try serving index.html
		if (url.pathname === "/" || url.pathname.endsWith("/")) {
			filePath = `./index.html`;
		}

		try {
			const file = Bun.file(filePath);
			// Check if file exists
			if (await file.exists()) {
				return new Response(file);
			}
			// Return 404 if file doesn't exist
			return new Response("Not Found", { status: 404 });
		} catch (e) {
			// Handle server errors
			return new Response("Internal Server Error", { status: 500 });
		}
	},
	host: "0.0.0.0",
});
