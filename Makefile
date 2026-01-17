.PHONY: dev dev-docker build up down logs clean install frontend backend

# Development locally (fast)
dev:
	@echo "Starting backend and frontend..."
	@cd backend && npm run dev &
	@cd frontend && npm run dev

# Development with Docker (slower but isolated)
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

# View logs
logs:
	docker compose logs -f

# Stop and remove volumes
clean:
	docker compose down -v

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
