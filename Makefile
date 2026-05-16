up:
	docker compose -f compose.dev.yaml up -d
down:
	docker compose -f compose.dev.yaml down
logs:
	docker compose -f compose.dev.yaml logs -f
ps:
	docker compose -f compose.dev.yaml ps