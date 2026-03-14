# Envora

A platform that provisions isolated demo environments (sandboxes) with AI-generated synthetic data. Each sandbox gets its own Postgres database and Docker container running a demo app. Define a scenario in natural language and Envora generates realistic seed data, spins up a fresh environment, and gives you a shareable URL.

## Architecture

```
Browser :3001 ──▶ Next.js Frontend ──proxy──▶ Express Backend :4000
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                              SQLite (platform)  Postgres 16     Docker
                              projects/scenarios  (one DB per    (one container
                              sandboxes metadata   sandbox)       per sandbox)
```

| Layer | Tech | Port |
|-------|------|------|
| Frontend | Next.js 14 + Blueprint.js 5 | 3001 |
| Backend | Express 5 + TypeScript | 4000 |
| Platform DB | SQLite via Prisma | file |
| Sandbox DBs | Postgres 16 (shared container, one DB per sandbox) | 5432 |
| Sandbox Apps | Docker containers on `sandbox-net` bridge | random |
| AI Generation | Claude API (Sonnet) via Anthropic SDK | - |

## Prerequisites

- **Node.js** 20+ and npm
- **Docker Desktop** (running)
- **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com))

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/dereksun00/envora.git
cd envora
```

### 2. Set up Docker infrastructure

Create the Docker network and shared Postgres container that all sandboxes will use:

```bash
# Create bridge network for sandbox containers
docker network create sandbox-net

# Start shared Postgres (stores all sandbox databases)
docker run -d \
  --name sandbox-postgres \
  --network sandbox-net \
  -e POSTGRES_USER=crm \
  -e POSTGRES_PASSWORD=crm_password \
  -p 5432:5432 \
  postgres:16
```

### 3. Build the demo CRM Docker image

The demo CRM app is the sample application that sandboxes run. Build its Docker image:

```bash
cd demo-crm
docker build -t demo-crm-app:latest .
cd ..
```

> This takes a few minutes on first build. The image name `demo-crm-app:latest` is what you'll enter as the Docker Image when creating a project.

### 4. Set up the backend

```bash
cd platform/backend
npm install

# Create your environment file
cp .env.example .env
```

Edit `platform/backend/.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Then initialize the platform database and start the server:

```bash
npx prisma db push    # Creates SQLite database
npm run dev            # Starts on http://localhost:4000
```

### 5. Set up the frontend

In a new terminal:

```bash
cd platform/frontend
npm install
npm run dev            # Starts on http://localhost:3001
```

### 6. Open the app

Go to [http://localhost:3001](http://localhost:3001). You should see the Overview dashboard.

## Project Structure

```
envora/
├── demo-crm/                     # Standalone CRM app (the app sandboxes run)
│   ├── Dockerfile                # Multi-stage build for sandbox containers
│   ├── prisma/schema.prisma      # CRM database schema
│   └── src/                      # Next.js CRM application
├── platform/
│   ├── shared/
│   │   └── types.ts              # Shared TypeScript types (frontend + backend)
│   ├── backend/
│   │   ├── prisma/schema.prisma  # Platform DB schema (SQLite)
│   │   ├── src/
│   │   │   ├── index.ts          # Express server entry point
│   │   │   ├── routes/           # API route handlers
│   │   │   └── lib/              # Core: provisioning, Docker, AI generation
│   │   └── .env.example          # Environment template
│   └── frontend/
│       ├── src/app/              # Next.js App Router pages
│       ├── src/components/       # React components (Blueprint.js)
│       └── src/lib/api.ts        # Typed API client
└── README.md
```

## Creating Your First Sandbox

1. **Create a Project** - Click "Projects" in the sidebar, then "New Project"
   - **Name**: e.g. "My CRM"
   - **Docker Image**: `demo-crm-app:latest`
   - **Schema**: paste the Prisma schema from `demo-crm/prisma/schema.prisma`
   - **Format**: Prisma
   - **App Port**: `3000`

2. **Create a Scenario** - On the project detail page, click "New Scenario"
   - **Name**: e.g. "Sales Demo"
   - **Prompt**: describe the data you want, e.g. "Generate a CRM with 30 contacts, 10 deals across various stages, and 3 demo user accounts"
   - **Demo Users**: add users with names, emails, and roles

3. **Launch** - Click the green "Launch" button on the scenario card
   - You'll be taken to the sandbox detail page
   - Watch the provisioning steps: database creation, schema application, AI data generation, seeding, container launch
   - When ready, click "Open Sandbox" to view your demo environment

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite path for platform DB | `file:./dev.db` |
| `SANDBOX_POSTGRES_HOST` | Postgres host for sandbox DBs | `localhost` |
| `SANDBOX_POSTGRES_PORT` | Postgres port | `5432` |
| `SANDBOX_POSTGRES_USER` | Postgres username | `crm` |
| `SANDBOX_POSTGRES_PASSWORD` | Postgres password | `crm_password` |
| `ANTHROPIC_API_KEY` | Claude API key for data generation | (required) |
| `PORT` | Backend server port | `4000` |
| `SANDBOX_NETWORK` | Docker network name | `sandbox-net` |
| `SANDBOX_POSTGRES_CONTAINER` | Postgres container name (Docker DNS) | `sandbox-postgres` |

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/overview` | Dashboard stats |
| GET | `/api/projects` | List projects with counts |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project detail with scenarios + sandboxes |
| POST | `/api/projects/:id/scenarios` | Create scenario |
| PUT | `/api/projects/:pid/scenarios/:sid` | Update scenario |
| DELETE | `/api/projects/:pid/scenarios/:sid` | Delete scenario |
| POST | `/api/projects/:pid/scenarios/:sid/duplicate` | Duplicate scenario |
| GET | `/api/sandboxes` | List sandboxes (filterable by status/project) |
| POST | `/api/sandboxes` | Create sandbox (starts async provisioning) |
| GET | `/api/sandboxes/:id` | Get sandbox status |
| PATCH | `/api/sandboxes/:id` | Lifecycle action (stop/start/reset/extend) |
| DELETE | `/api/sandboxes/:id` | Destroy sandbox |

## Troubleshooting

**`role "crm" does not exist`**
Your Postgres container was started without the correct user. Remove and recreate it:
```bash
docker rm -f sandbox-postgres
docker run -d --name sandbox-postgres --network sandbox-net \
  -e POSTGRES_USER=crm -e POSTGRES_PASSWORD=crm_password \
  -p 5432:5432 postgres:16
```

**`Cannot find module '../../shared/types'`**
Use the `@shared/types` path alias, not relative imports. Both frontend and backend tsconfigs have `@shared/*` mapped to `../shared/*`.

**Port 5432 already in use**
Another Postgres instance is running. Stop it or change `SANDBOX_POSTGRES_PORT` in `.env`.

**Docker build fails for demo-crm**
Make sure Docker Desktop is running and you're in the `demo-crm/` directory.

**Sandbox stuck on "Waiting for app to be ready"**
The container started but the app isn't responding. Check container logs:
```bash
docker logs <container-id>
```

**Frontend shows blank page / API errors**
Make sure the backend is running on port 4000. The frontend proxies `/api/*` to `localhost:4000`.
