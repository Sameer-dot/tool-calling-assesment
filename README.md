# AI Chat Agent with Tool Calling

A conversational AI assistant that helps users book appointments, search products, and learn about company services—all through natural language. Built with explicit intent routing, structured tool execution, and a live tool trace panel so you can see exactly what's happening under the hood.

## What It Does

Chat with the agent to:

- **Book appointments** — "Book me Botox next Wednesday"
- **Search products** — "Which sunscreen for oily skin under 120 SAR?"
- **Get company info** — "What are your working hours?" or "What's your refund policy?"

The agent routes your message to the right tools, executes them, and responds with grounded answers. No hallucination—everything comes from the tools or the knowledge base.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | Node.js, Express, TypeScript |
| Frontend | React, Vite, TypeScript |
| Tools | Mock calendar, mock catalog, knowledge base (RAG) |

## Quick Start

### Option 1: Local Development

You'll need two terminals.

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. The frontend proxies `/api` to the backend automatically.

### Option 2: Docker

```bash
docker compose up --build
```

Then open **http://localhost:5173**. Both services run in containers.

## Environment Variables

Copy the example file and configure:

```bash
cp .env.example .env
```

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | 3001 | Backend port |
| `NODE_ENV` | development | Set to `production` for deployment |
| `GOOGLE_AI_API_KEY` | — | Optional. Enables semantic RAG with Google Gemini embeddings. Get a free key at [aistudio.google.com](https://aistudio.google.com). |

Without `GOOGLE_AI_API_KEY`, the knowledge base uses keyword search. With it, semantic search (embeddings) is used for better relevance.

## Project Structure

```
tool-calling/
├── backend/
│   └── src/
│       ├── api/           # REST routes
│       ├── controllers/   # Request handlers
│       ├── domain/        # Types, constants
│       ├── middleware/    # Validation, error handling
│       ├── rag/           # Embeddings, vector search
│       ├── router/        # Intent routing
│       ├── services/      # Orchestration
│       └── tools/         # Calendar, catalog, knowledge
├── frontend/
│   └── src/
│       ├── api/           # Chat API client
│       ├── components/    # Chat, ToolTracePanel
│       ├── hooks/         # useChat, useAutoScroll
│       ├── layouts/       # AppLayout
│       └── styles/        # Global CSS, variables
├── docs/
│   └── company-knowledge.txt   # Knowledge base for RAG
└── docker-compose.yml
```

## Features

- **Intent routing** — Routes to calendar, catalog, knowledge, or clarification based on keywords
- **Multi-domain** — Combines catalog + knowledge for product recommendations with clinic guidance
- **Calendar tools** — Find availability, create, update, cancel events (mock, default timezone: Asia/Riyadh)
- **Catalog tools** — Search products, get details, compare (mock skincare data)
- **Knowledge (RAG)** — Semantic search (Google Gemini embeddings) or keyword fallback over `docs/company-knowledge.txt`
- **Tool trace panel** — Shows domain, tool name, arguments, response, and RAG details (query, chunk IDs, snippets)
- **Clarification** — Asks for missing info (e.g. date when booking) before calling tools
- **Clear chat** — Reset the conversation and tool trace with one click

## Deployment

- **Frontend:** Deploy to [Vercel](https://vercel.com) — see [DEPLOYMENT.md](DEPLOYMENT.md)
- **Backend:** Deploy to [Railway](https://railway.app) — see [DEPLOYMENT.md](DEPLOYMENT.md)

Set `VITE_API_BASE` (frontend) to your Railway backend URL. Include `GOOGLE_AI_API_KEY` (backend) for semantic RAG.

## License

MIT
