.PHONY: dev dev-docker build up down logs clean install frontend backend restart shell-backend shell-frontend

# Development locally (fast)
dev:
	@echo "Starting backend and frontend..."
	@cd backend && npm run dev &
	@cd frontend && npm run dev

# Development with Docker
dev-docker:
	docker compose up --build

# Build containers without starting
build:
	docker compose build

# Start containers in background
up:
	docker compose up -d

# Stop containers
down:
	docker compose down

# Restart containers
restart:
	docker compose restart

# View logs
logs:
	docker compose logs -f

# View backend logs only
logs-backend:
	docker compose logs -f backend

# View frontend logs only
logs-frontend:
	docker compose logs -f frontend

# Stop and remove volumes
clean:
	docker compose down -v
	rm -rf data/app.db

# Install dependencies locally
install:
	cd frontend && npm install
	cd backend && npm install

# Run frontend only
frontend:
	cd frontend && npm run dev

# Run backend only
backend:
	cd backend && npm run dev

# Open shell in backend container
shell-backend:
	docker compose exec backend sh

# Open shell in frontend container
shell-frontend:
	docker compose exec frontend sh

# Show container status
status:
	docker compose ps
