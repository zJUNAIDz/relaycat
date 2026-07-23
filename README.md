<div align="center">

# 🐱 RelayCat

### A full-stack, real-time chat platform inspired by Discord — servers, channels, voice/video, DMs, presence, and more.

<p>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="TanStack Query" src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" />
  <img alt="Zod" src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" />
  <img alt="Hono" src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" />
  <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" />
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="Drizzle" src="https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" />
  <img alt="Redis" src="https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white" />
  <img alt="MinIO" src="https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white" />
  <img alt="LiveKit" src="https://img.shields.io/badge/LiveKit-1FD5F9?style=for-the-badge&logo=livekit&logoColor=black" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img alt="Nginx" src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" />
  <img alt="Cloudflare" src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
  <img alt="Grafana" src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" />
</p>

<p>
  <a href="#-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-deployment">Deployment</a>
</p>

</div>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 💬 | **Real-Time Messaging** | Instant send / edit / delete over Socket.IO with **optimistic UI** — messages render immediately and reconcile on server ack, with **zero refetch round-trips**. |
| 🏰 | **Servers & Channels** | Create servers, organize text / audio / video channels into sections, and manage members. |
| 🎙️ | **Voice & Video** | High-quality WebRTC rooms powered by **LiveKit**, with server-issued access tokens. |
| 🛡️ | **RBAC & Permissions** | Discord-style **per-server custom roles** with **bitmask permissions** (OR-combined across a member's roles), a seeded `@everyone` default role, **position-based role hierarchy**, and an **owner super-user** — all enforced server-side by central permission middleware inside ACID transactions. |
| 🟢 | **Live Presence** | Online / Idle / DnD / Invisible status with heartbeats, auto-idle, and **Redis-backed fan-out** for horizontal scaling. |
| ✍️ | **Typing Indicators** | Real-time "user is typing…" across channels and DMs. |
| 📨 | **Direct Messages** | Private 1:1 conversations with cursor-paginated history. |
| 👋 | **Friends System** | Send / accept / decline friend requests and manage your friends list. |
| 🔔 | **Notifications** | In-app notifications **+ Web Push (VAPID)** for background delivery, with **sound alerts** and **mute / unmute** controls. |
| 📎 | **Rich File Sharing** | Presigned **S3 / MinIO** uploads across **8 media policies** (images, video, audio, PDFs/docs) with server-enforced size & MIME limits. |
| 🧑‍🎨 | **Rich Profiles** | Customizable display identity — avatar, banner, bio, pronouns, accent color, links — modeled separately from auth, with profile overlays across the app. |
| 🔗 | **Invite & Discovery** | Unique invite codes and a server **discovery** page to grow communities. |
| 🔐 | **Secure Auth** | OAuth (Google / GitHub) + verified-email sign-in via **Better Auth**; OAuth avatars re-hosted to S3. |
| 📊 | **Observability** | Structured logging shipped to **Loki** and visualized in **Grafana**. |
| 🎨 | **Polished, Themed UI** | Responsive Tailwind + Shadcn UI with dark/light theming and Framer Motion. |

---

## 🛠 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend — `apps/web`
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS · Shadcn UI · Lucide
- **State:** Zustand · TanStack Query
- **Real-time:** Socket.IO Client · LiveKit (WebRTC)
- **Forms / Validation:** React Hook Form · Zod
- **Animation:** Framer Motion

</td>
<td valign="top" width="50%">

### Backend — `apps/server`
- **Runtime:** Bun
- **Framework:** Hono
- **Database:** PostgreSQL + Drizzle ORM
- **Real-time:** Socket.IO (Redis adapter)
- **Auth:** Better Auth
- **Storage:** S3 / MinIO (AWS SDK)
- **Cache / Presence:** Redis
- **Validation:** Zod

</td>
</tr>
</table>

**Monorepo & Infra:** Turborepo · shared `packages/types` (end-to-end Zod contract) · Docker (multi-stage) · Nginx (TLS reverse proxy) · Cloudflare Tunnel · Loki + Grafana

---

## 🏗 Architecture

A Turborepo monorepo with a **Bun/Hono API** and a **Next.js client** sharing a single typed contract package. Real-time state flows over Socket.IO, backed by Redis for multi-instance fan-out.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#5865F2','primaryTextColor':'#fff','lineColor':'#8b5cf6','fontFamily':'Inter'}}}%%
flowchart TB
    subgraph Client["🖥️  apps/web · Next.js 16"]
        UI["React UI<br/>Tailwind · Shadcn"]
        Q["TanStack Query<br/>(optimistic cache)"]
        Z["Zustand stores<br/>(presence · modals)"]
        SC["Socket.IO client"]
        LK["LiveKit client"]
    end

    subgraph Edge["🌐  Edge"]
        CF["Cloudflare Tunnel"]
        NX["Nginx · TLS"]
    end

    subgraph Server["⚙️  apps/server · Bun + Hono"]
        API["REST API<br/>(modular routes)"]
        WS["Socket.IO gateway<br/>presence · typing · chat"]
        AUTH["Better Auth"]
        SVC["Domain services<br/>(ACID txns · RBAC)"]
    end

    subgraph Data["🗄️  Data & Infra"]
        PG[("PostgreSQL<br/>Drizzle ORM")]
        RD[("Redis<br/>presence · adapter")]
        S3[("MinIO / S3<br/>media")]
        LKS["LiveKit SFU"]
        OBS["Loki + Grafana"]
    end

    UI --> Q --> API
    UI --> Z
    SC <--> WS
    LK <--> LKS
    Client --> CF --> NX --> Server
    API --> AUTH
    API --> SVC --> PG
    WS --> RD
    SVC --> S3
    Server --> OBS

    classDef client fill:#5865F2,stroke:#3b46c4,color:#fff;
    classDef edge fill:#f59e0b,stroke:#b45309,color:#fff;
    classDef server fill:#10b981,stroke:#047857,color:#fff;
    classDef data fill:#8b5cf6,stroke:#6d28d9,color:#fff;
    class UI,Q,Z,SC,LK client;
    class CF,NX edge;
    class API,WS,AUTH,SVC server;
    class PG,RD,S3,LKS,OBS data;
```

### 🟢 Real-Time Presence Flow

Presence runs on the root Socket.IO namespace with **pull-based fan-out**: a client subscribes only to the user IDs it renders, and a status change broadcasts to just that watch-room. Redis makes this work across multiple server instances; an in-memory store is the zero-config local fallback.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#10b981','primaryTextColor':'#fff','lineColor':'#10b981','actorBkg':'#5865F2','actorTextColor':'#fff','signalColor':'#8b5cf6','signalTextColor':'#334155'}}}%%
sequenceDiagram
    participant C as 🖥️ Client
    participant WS as ⚙️ Socket.IO Gateway
    participant R as 🗄️ Redis Store
    participant W as 👀 Watchers

    C->>WS: connect (session token)
    WS->>WS: auth handshake → userId
    WS->>R: mark online + track socket
    C->>WS: presence:subscribe([ids])
    WS->>WS: join watch-rooms
    loop every 25s
        C->>WS: heartbeat
    end
    Note over C: idle 5 min / tab hidden
    C->>WS: setStatus(idle)
    WS->>R: update status + lastSeen
    R-->>W: broadcast to watch-room
    Note over WS,R: periodic reapStale() sweep<br/>self-heals crashed sockets
```

### ⚡ Optimistic Messaging & Keyset Pagination

Channel history uses **keyset (cursor) pagination on UUIDv7 message IDs** with `before` / `after` seeks — reads stay constant-time regardless of message volume. Sends/edits/deletes mutate the TanStack Query cache instantly and reconcile on socket ack.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#8b5cf6','primaryTextColor':'#fff','lineColor':'#f59e0b'}}}%%
flowchart LR
    A["✍️ User sends message"] --> B["Optimistic insert<br/>into Query cache"]
    B --> C["UI updates<br/>instantly"]
    A --> D["POST /messages<br/>(ACID txn + RBAC)"]
    D --> E[("PostgreSQL<br/>UUIDv7 + composite idx")]
    D --> F["Socket.IO emit"]
    F --> G["Other clients<br/>receive in real time"]
    D --> H["ack → reconcile<br/>optimistic entry"]

    classDef a fill:#5865F2,stroke:#3b46c4,color:#fff;
    classDef b fill:#10b981,stroke:#047857,color:#fff;
    classDef c fill:#8b5cf6,stroke:#6d28d9,color:#fff;
    class A,C,G a;
    class B,H b;
    class D,E,F c;
```

---

## 📦 Project Structure

```
relaycat/
├── apps/
│   ├── server/                  # Bun + Hono API
│   │   └── src/
│   │       ├── db/schema/       # Drizzle schemas (servers, channels, messages, roles…)
│   │       ├── drizzle/         # SQL migrations + snapshots
│   │       ├── modules/         # Feature modules: route + service + types
│   │       │   ├── channels/  dm/  friends/  guilds/
│   │       │   ├── members/   messages/  notifications/
│   │       │   └── push/  roles/  profiles/
│   │       ├── socket/          # Socket.IO gateway, auth, presence
│   │       ├── middlewares/     # auth, permission (RBAC), logger
│   │       ├── services/        # permission, profile, S3
│   │       └── lib/             # auth, db, redis, s3, mail, socket-manager
│   └── web/                     # Next.js 16 client
│       ├── app/                 # App Router (landing, auth, main, invite)
│       └── features/            # chat, server, channel, presence, friends,
│                                #   notifications, profile, role, typing, socket
├── packages/
│   └── types/                   # Shared Zod contract + socket event types
├── deploy/                      # Nginx config
├── compose.dev.yaml             # Local infra (Postgres, MinIO, …)
├── compose.prod.yaml            # Prod stack (+ Loki, Grafana)
└── turbo.json
```

### 🔌 API Surface (protected routes)

| Prefix | Module |
|---|---|
| `/servers`, `/servers/:serverId/roles` | Guilds & RBAC roles |
| `/channels` | Channel management |
| `/members` | Server membership |
| `/messages` | Channel messages (cursor-paginated) |
| `/dm` | Direct messages |
| `/friends` | Friend requests & list |
| `/profiles` | User profiles |
| `/notifications`, `/push` | Notifications & Web Push |
| `/s3` | Presigned upload URLs |

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) `v1.2+`
- [Docker](https://www.docker.com/) & Docker Compose
- Node.js `v18+` (for tooling compatibility)

### 1. Clone & install

```bash
git clone https://github.com/zJUNAIDz/relaycat.git
cd relaycat
bun install
```

### 2. Configure environment

Copy the example env files and fill in the values:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Key server variables (see `.env.example` for the full list):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/relaycat"

# Better Auth
BETTER_AUTH_URL="http://localhost:3001"
BETTER_AUTH_SECRET="<strong-random-string>"
CLIENT_URL="http://localhost:3000"

# OAuth
AUTH_GOOGLE_ID=        AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=        AUTH_GITHUB_SECRET=

# S3 / MinIO
AWS_S3_ENDPOINT="http://localhost:9000"
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET_NAME="relaycat-media"
MEDIA_BASE_URL="http://localhost:9000"

# Presence / realtime (optional — required for multi-instance)
REDIS_URL="redis://localhost:6379"

# Email (SendGrid / SMTP2GO) + Web Push (VAPID)
SENDGRID_API_KEY=      VERIFIED_SENDER_EMAIL=
VAPID_PUBLIC_KEY=      VAPID_PRIVATE_KEY=      VAPID_SUBJECT="mailto:admin@relaycat.app"
```

> 💡 Generate VAPID keys with `bunx web-push generate-vapid-keys`.

### 3. Start infrastructure

```bash
docker compose -f compose.dev.yaml up -d   # PostgreSQL, MinIO, etc.
```

### 4. Apply the database schema

```bash
cd apps/server
bun run db:push      # or db:migrate to run versioned migrations
```

### 5. Run the app

```bash
bun run dev          # from repo root — Turbo runs web + server
```

- **Web:** http://localhost:3000
- **API:** http://localhost:8000

---

## 🚢 Deployment

Production runs as a containerized stack defined in `compose.prod.yaml`:

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#f59e0b','primaryTextColor':'#fff','lineColor':'#8b5cf6'}}}%%
flowchart LR
    U["🌍 Users"] --> CF["☁️ Cloudflare Tunnel"]
    CF --> NX["🔒 Nginx · TLS"]
    NX --> WEB["Next.js (web)"]
    NX --> API["Hono (server)"]
    NX --> MIN["MinIO (media)"]
    API --> PG[("PostgreSQL 18")]
    API --> MIN
    API --> LOKI["Loki"] --> GRAF["📊 Grafana"]

    classDef edge fill:#f59e0b,stroke:#b45309,color:#fff;
    classDef app fill:#10b981,stroke:#047857,color:#fff;
    classDef data fill:#8b5cf6,stroke:#6d28d9,color:#fff;
    class CF,NX edge;
    class WEB,API app;
    class PG,MIN,LOKI,GRAF data;
```

- **Multi-stage Docker builds** for both `apps/web` and `apps/server` keep images lean.
- Public ports bind to `127.0.0.1` only; **host Nginx** reverse-proxies the `rc*` subdomains and **Cloudflare Tunnel** fronts Nginx (no exposed origin).
- **Loki + Grafana** provide centralized logging and dashboards.

```bash
docker compose -f compose.prod.yaml up -d
```

---

## 📄 License

Licensed under the **MIT License**.
