# Once

> This project is currently in active development and may contain bugs or incomplete features.

Once is an AI-powered interactive storytelling platform where you become the protagonist of your own narrative. The system uses LLMs to generate immersive, branching stories that respond to your choices in real-time.

The application features a memory system that tracks characters, locations, relationships, and events across your story, ensuring narrative consistency and meaningful callbacks to earlier moments.


## Prerequisites

Before starting, ensure you have:
1. Bun installed
2. Docker and Docker Compose installed
3. An LLM API key (OpenAI or Google)


## Local Development Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd once
bun install
```

### 2. Environment Configuration

Copy the example environment file and fill in your values:

```bash
cp .example.env .env
```

#### Required Variables

```bash
# Database (uses Docker-provided Postgres)
DATABASE_URL="postgresql://once:once_password_123@localhost:5432/once"

# Auth secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-generated-secret
BETTER_AUTH_URL="http://localhost:3001"

# Memory mode: "local" for Docker services, "cloud" for hosted Qdrant/Neo4j
MEMORY_MODE=local
```

#### LLM Provider (choose one)

**Option A: OpenAI**
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_LLM_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

**Option B: Google Gemini**
```bash
LLM_PROVIDER=google
GOOGLE_API_KEY=your-google-api-key
GOOGLE_LLM_MODEL=gemini-3-flash-preview
GOOGLE_EMBEDDING_MODEL=gemini-embedding-001
```

### 3. Start Infrastructure

Start the vector database (Qdrant) and graph database (Neo4j) using Docker:

```bash
docker-compose up -d
```

### 4. Database Setup

Push the database schema:

```bash
cd packages/database
bun run db:push
```

### 5. Start Development Servers

From the root directory:

```bash
bun run dev
```

This starts both the API server (port 3001) and the web application (port 3000).


## Project Structure

```
once/
  apps/
    api/          Backend API (Hono + Bun)
    web/          Frontend (Next.js)
  packages/
    database/     Database schema and client (Drizzle)
    shared/       Shared types and schemas
```


## Available Commands

```bash
bun run dev       # Start all apps in development mode
bun run build     # Build all apps for production
bun run lint      # Lint all packages
bun run format    # Format code with Prettier
```
