# Once — Project Progress

---

## Technology Stack

### Backend
- Hono (HTTP framework)
- Bun (runtime)
- PostgreSQL (database)
- Drizzle ORM
- Zod (validation)

### LLM Integration
- Vercel AI SDK
- SSE streaming
- OpenAI

### Memory
- Neo4j (knowledge graph)
- Qdrant (vector store)
- Mem0 (orchestration)

### Infrastructure
- Turborepo (monorepo)
- Redis/Upstash (cache, rate limiting, sessions)
- Better Auth (authentication)

---

## Task List

### Phase 1: Project Foundation

- [x] Define monorepo structure (apps/, packages/)
- [x] Create database package (packages/database)
- [x] Setup TypeScript configuration
- [ ] Configure ESLint and Prettier
- [ ] Setup path aliases
- [x] Install and configure Drizzle ORM
- [x] Create database client export (src/index.ts)

### Phase 2: Database Schema

- [x] Define narrative stance enum
- [x] Define story visibility enum
- [x] Define story status enum
- [x] Define story mode enum
- [x] Define echo status enum
- [x] Define codex entry type enum
- [x] Create stories table
- [x] Create protagonists table
- [x] Create scenes table
- [x] Create echoes table
- [x] Create vault characters table
- [x] Create deferred characters table
- [x] Create codex entries table
- [x] Create story upvotes table
- [x] Create story suggestions table
- [x] Define all table relations
- [ ] Generate initial migration
- [ ] Test migration against PostgreSQL
- [ ] Create seed scripts for development

### Phase 3: API Layer (Hono)

- [ ] Create API package
- [ ] Setup Hono with base configuration
- [ ] Configure CORS middleware
- [ ] Setup request logging middleware
- [ ] Setup error handling middleware
- [ ] Setup request ID middleware
- [ ] Create Zod schemas for requests
- [ ] Implement validation middleware
- [ ] Define response envelope

### Phase 4: Core API Endpoints

- [ ] GET /health
- [ ] POST /stories
- [ ] GET /stories
- [ ] GET /stories/:id
- [ ] DELETE /stories/:id
- [ ] POST /stories/:id/continue
- [ ] POST /stories/:id/fork
- [ ] GET /stories/:id/scenes
- [ ] GET /stories/:id/codex
- [ ] GET /stories/:id/echoes

### Phase 5: Protagonist Endpoints

- [ ] GET /stories/:id/protagonists
- [ ] POST /stories/:id/protagonists
- [ ] PATCH /stories/:id/protagonists/:pid
- [ ] POST /stories/:id/protagonists/:pid/activate

### Phase 6: Character Vault Endpoints

- [ ] GET /vault
- [ ] POST /vault
- [ ] GET /vault/:id
- [ ] PATCH /vault/:id
- [ ] DELETE /vault/:id
- [ ] POST /vault/from-protagonist

### Phase 7: LLM Integration

- [ ] Install Vercel AI SDK
- [ ] Configure OpenAI provider
- [ ] Create LLM service abstraction
- [ ] Implement story initialization
- [ ] Implement story continuation
- [ ] Define response schemas
- [ ] Implement SSE streaming
- [ ] Add retry logic
- [ ] Add timeout handling
- [ ] Implement token counting

### Phase 8: Prompt System

- [ ] Create prompt template system
- [ ] Create initialization prompt
- [ ] Create continuation prompt
- [ ] Create codex extraction prompt
- [ ] Create echo evaluation prompt
- [ ] Add narrative stance variations
- [ ] Add story mode variations

### Phase 9: Memory System (Mem0)

- [ ] Configure Mem0 with Neo4j and Qdrant
- [ ] Create memory service wrapper
- [ ] Implement store operation
- [ ] Implement search operation
- [ ] Add user isolation
- [ ] Add story isolation
- [ ] Implement relevance scoring
- [ ] Add health checks

### Phase 10: Echo System

- [ ] Implement echo creation
- [ ] Implement trigger evaluation
- [ ] Implement echo resolution
- [ ] Handle echo expiration

### Phase 11: Deferred Characters

- [ ] Implement creation
- [ ] Implement trigger evaluation
- [ ] Implement introduction flow
- [ ] Link to scenes

### Phase 12: Codex System

- [ ] Implement entity extraction
- [ ] Implement entry creation
- [ ] Implement entry updates
- [ ] Respect user-edited entries
- [ ] Inject into context

### Phase 13: Caching Layer

- [ ] Setup Redis connection
- [ ] Cache story metadata
- [ ] Cache recent scenes
- [ ] Cache session data
- [ ] Implement invalidation
- [ ] Add ETag support
- [ ] Add Cache-Control headers

### Phase 14: Rate Limiting

- [ ] Setup Upstash Ratelimit
- [ ] Per-IP limiting
- [ ] Per-user limiting
- [ ] Define endpoint limits
- [ ] Add X-RateLimit headers

### Phase 15: Authentication

- [ ] Install Better Auth
- [ ] Setup Redis sessions
- [ ] Create session middleware
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] POST /auth/logout
- [ ] GET /auth/me
- [ ] Protect routes

### Phase 16: Publishing and Community

- [ ] PATCH /stories/:id/visibility
- [ ] GET /stories/public
- [ ] POST /stories/:id/upvote
- [ ] DELETE /stories/:id/upvote
- [ ] POST /stories/:id/suggestions
- [ ] GET /stories/:id/suggestions
- [ ] PATCH /suggestions/:id

### Phase 17: Observability

- [ ] Install Pino
- [ ] Configure log levels
- [ ] Request/response logging
- [ ] LLM call logging
- [ ] Error tracking
- [ ] Alerting

### Phase 18: Testing

- [ ] Setup Vitest
- [ ] Test LLM service
- [ ] Test database operations
- [ ] Test API endpoints
- [ ] Test validation schemas
- [ ] Load testing

### Phase 19: Frontend Integration

- [ ] SSE consumption
- [ ] Streamdown integration
- [ ] Story creation flow
- [ ] Story continuation UI
- [ ] Protagonist state display
- [ ] Codex viewer
- [ ] Vault management
- [ ] Fork visualization
- [ ] Publishing flow
- [ ] Community discovery

### Phase 20: Deployment

- [ ] Create Dockerfile
- [ ] Environment configuration
- [ ] Docker Compose for local
- [ ] CI/CD pipeline
- [ ] Database hosting
- [ ] Redis hosting
- [ ] Neo4j hosting
- [ ] Qdrant hosting
- [ ] Production deployment
- [ ] Health monitoring

### Phase 21: Security Hardening

- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CORS review
- [ ] Secrets management
- [ ] Security headers
- [ ] Request size limits
- [ ] Timeout limits
- [ ] API versioning

---

## Current Status

**Completed**: Phase 1 (partial), Phase 2 (schema complete)

**Next**: Generate migrations, test against PostgreSQL

---

## Notes

- Vault character limits: enforce at application layer (free: 5, premium: unlimited)
- Auth tables will be generated by Better Auth, not manually defined

---

*Last updated: 2024-12-26*
