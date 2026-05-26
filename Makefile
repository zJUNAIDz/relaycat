up:
	docker compose -f compose.dev.yaml up -d
down:
	docker compose -f compose.dev.yaml down
stop:
	docker compose -f compose.dev.yaml stop
logs:
	docker compose -f compose.dev.yaml logs -f
ps:
	docker compose -f compose.dev.yaml ps