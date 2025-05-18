dev:
	zellij --layout=dev.zellij
api-dev:
	cd project/mono/apps/api && bun dev
api-test:
	cd project/mono/apps/api && bun test
app-dev:
	cd project/mono/apps/app && bun dev
app-build:
	cd project/mono/apps/app && bun run build
api-client-refresh:
	cd project/mono/packages/api-client && bun openapi:refresh

build:
	docker compose build
push: build
	docker compose push
