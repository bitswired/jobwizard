dev:
	zellij --layout=dev.zellij
api-dev:
	cd project/mono/apps/api && bun dev
api-test:
	cd project/mono/apps/api && bun test
app-dev:
	cd project/mono/apps/app && bun dev
api-client-refresh:
	cd project/mono/packages/api-client && bun openapi:refresh

