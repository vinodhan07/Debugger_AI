# 🚀 Debuggers AI --- Enterprise Multi-Agent RAG Platform

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic-orange)
![Ollama](https://img.shields.io/badge/Ollama-LLM-green)
![Postgres](https://img.shields.io/badge/PostgreSQL-15-blue)
![pgvector](https://img.shields.io/badge/pgvector-Enabled-purple)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![Celery](https://img.shields.io/badge/Celery-Worker-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)
![License](https://img.shields.io/badge/License-MIT-yellow)

Enterprise-grade AI platform with multi-agent reasoning, secure RAG, JWT
authentication, RBAC, document lifecycle governance, and
production-ready deployment architecture.

------------------------------------------------------------------------

# 🏗 Architecture

Browser (JWT Auth)\
↓\
Next.js (3000)\
↓\
FastAPI (8000)\
↓\
LangGraph Multi-Agent System\
↓\
Retriever (pgvector, user-scoped)\
↓\
Ollama LLM\
↓\
Postgres + Redis + Celery

------------------------------------------------------------------------

# 🛠 Tech Stack

## 🧠 AI & Agent Layer

-   LangGraph (Multi-Agent Orchestration)
-   Ollama (LLM Runtime)
-   Quantized LLM (llama3:8b-instruct-q4_0)
-   Retrieval-Augmented Generation (RAG)

## ⚙ Backend

-   FastAPI
-   SQLAlchemy ORM
-   PostgreSQL
-   pgvector (Vector Similarity Search)
-   Redis (Caching)
-   Celery (Async Workers)
-   JWT Authentication
-   Role-Based Access Control (RBAC)
-   SlowAPI (Rate Limiting)

## 🎨 Frontend

-   Next.js (App Router)
-   TypeScript
-   Tailwind CSS
-   Streaming UI
-   Admin Dashboard
-   Document Lifecycle UI

## 📦 Infrastructure

-   Docker & Docker Compose
-   Nginx (Reverse Proxy)
-   Prometheus (Metrics)
-   Multi-worker Uvicorn

------------------------------------------------------------------------

# 🔐 Security Features

-   JWT-based Authentication
-   Role-Based Endpoint Protection (Admin/User/Viewer)
-   User-scoped Retrieval
-   SHA256 Duplicate File Detection
-   Soft Delete Document Governance
-   Rate Limiting & Abuse Protection
-   Protected Metrics Endpoint

------------------------------------------------------------------------

# ⚡ Performance Optimizations

-   Quantized LLM Model
-   Context Window Trimming
-   Redis Retrieval Cache
-   Async Background Ingestion
-   Parallel Worker Scaling

✅ Achieved 3--5× faster response times after optimization.

------------------------------------------------------------------------

## 📂 Project Structure

    debuggers-ai/
    │
    ├── backend/
    │   ├── agents/
    │   │   ├── planner.py
    │   │   ├── coder.py
    │   │   ├── debugger.py
    │   │   ├── retriever.py
    │   │   ├── memory.py
    │   │   └── router.py
    │   │
    │   ├── ingestion/
    │   │   ├── loader.py
    │   │   ├── chunker.py
    │   │   └── ingest.py
    │   │
    │   ├── auth.py
    │   ├── dependencies.py
    │   ├── database.py
    │   ├── models.py
    │   ├── schemas.py
    │   ├── main.py
    │   └── celery_worker.py
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── app/
    │   │   │   ├── page.tsx
    │   │   │   ├── admin/page.tsx
    │   │   │   └── login/page.tsx
    │   │   │
    │   │   ├── components/
    │   │   │   ├── ChatBox.tsx
    │   │   │   ├── Message.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   ├── SettingsDrawer.tsx
    │   │   │   ├── Feedback.tsx
    │   │   │   └── PreviewModal.tsx
    │   │   │
    │   │   ├── lib/
    │   │   │   ├── api.ts
    │   │   │   └── auth.tsx
    │   │   │
    │   │   └── styles/
    │   │       └── globals.css
    │   │
    │   └── package.json
    │
    ├── docker-compose.yml
    ├── docker-compose.prod.yml
    ├── nginx.conf
    └── README.md

------------------------------------------------------------------------

## 🏗 Architecture

    Browser (JWT Auth)
            ↓
    Next.js (3000)
            ↓
    FastAPI (8000)
            ↓
    LangGraph Multi-Agent System
            ↓
    Retriever (pgvector, user-scoped)
            ↓
    Ollama LLM
            ↓
    Postgres + Redis + Celery

------------------------------------------------------------------------

## 📚 RAG Features

-   User-scoped pgvector retrieval
-   SHA256 duplicate detection
-   Soft delete governance
-   Multi-format ingestion (PDF, TXT, MD, CSV, DOCX)
-   Background ingestion via Celery
-   Redis retrieval caching

------------------------------------------------------------------------

## ⚡ Performance Optimization

-   Quantized LLM (llama3:8b-instruct-q4_0)
-   Context trimming
-   Redis caching
-   Async ingestion
-   Uvicorn multi-worker support

3--5× faster responses achieved.

------------------------------------------------------------------------

## 🚀 Getting Started

### Clone

    git clone https://github.com/yourusername/debuggers-ai.git
    cd debuggers-ai

### Start Services

    docker compose up --build

Frontend → http://localhost:3000\
Backend → http://localhost:8000

### Pull Optimized Model

    docker exec -it debug-ai-ollama-1 ollama pull llama3:8b-instruct-q4_0

### Promote Admin

    UPDATE users SET role='admin' WHERE email='your@email.com';

------------------------------------------------------------------------

# 📈 Project Status

  Stage      Feature                    Status
  ---------- -------------------------- -------------
  Stage 8    Document Governance        ✅ Complete
  Stage 9    RBAC & Admin               ✅ Complete
  Stage 10   Performance Optimization   ✅ Complete
  Stage 11   Cloud Deployment           🚧 Ready
  Stage 12   Billing & Usage Tracking   🔜 Planned

------------------------------------------------------------------------
## 🏆 Summary

Debuggers AI is a multi-tenant, enterprise-ready AI platform with full
document governance and agentic reasoning.

Designed for: - Enterprise internal AI systems - Secure knowledge
platforms - SaaS AI startups
