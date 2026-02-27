# Deployment Guide: Project Phoenix RAG Platform

This guide outlines the steps to deploy the Project Phoenix backend in a production environment.

## 1. Prerequisites
- Docker & Docker Compose
- Domain Name (optional for local testing)
- SSL Certificate (recommended)

## 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@db:5432/db
SECRET_KEY=your_super_secret_key_here
OLLAMA_HOST=http://ollama:11434
```

## 3. Launching Production Mode
Use the production-hardened compose file:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
This will:
- Enable **Restart Always** policies.
- Run Uvicorn with **4 worker processes** for concurrency.
- Launch a **Celery Worker** for background ingestion.
- Launch a **Redis** broker for task management.
- Launch an **Nginx** reverse proxy on port 80.

## 4. Post-Deployment Check
- **Metrics**: Visit `http://your-server-ip/metrics` to verify Prometheus data (Proxied via Nginx).
- **Safety**: Test with `python test_safety.py`.
- **RAG Performance**: Ensure retrieval is fast (IVFFlat index is active).

## 5. Scaling
- **Vector Search**: As your document count grows (>10k), consider upgrading the IVFFlat index `lists` parameter.
- **Ollama**: For heavy production load, move Ollama to a dedicated server with GPU support.

## 6. Observability
Connect a **Grafana** instance to the `/metrics` endpoint to visualize latency and throughput.
