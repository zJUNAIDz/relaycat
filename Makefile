DEV  := compose.dev.yaml
PROD := compose.prod.yaml

# ---- Development (infra only; run apps with `bun dev` on the host) ----
infra-up:
	docker compose -f $(DEV) up -d
infra-down:
	docker compose -f $(DEV) down
infra-stop:
	docker compose -f $(DEV) stop
infra-logs:
	docker compose -f $(DEV) logs -f
infra-ps:
	docker compose -f $(DEV) ps

# ---- Production (full container-first stack) ----
prod-up:
	docker compose -f $(PROD) up -d --build
prod-down:
	docker compose -f $(PROD) down
prod-stop:
	docker compose -f $(PROD) stop
prod-logs:
	docker compose -f $(PROD) logs -f
prod-ps:
	docker compose -f $(PROD) ps
prod-build:
	docker compose -f $(PROD) build
# Apply Drizzle migrations against the prod database.
prod-migrate:
	docker compose -f $(PROD) run --rm server bunx drizzle-kit migrate
