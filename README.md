# RelayCat 🐱

RelayCat is a full-stack, real-time chat application inspired by Discord. It allows users to create servers, join channels (text, audio, video), and communicate in real-time with friends and communities. Built with modern web technologies for high performance and scalability.

## ✨ Features

-   **Real-time Messaging**: Instant messaging powered by Socket.io.
-   **Servers & Channels**: Create and customize servers.
-   **Voice & Video Calls**: High-quality voice and video chat integration using LiveKit.
-   **Role-Based Access Control**: Manage permissions with roles (Guest, Moderator, Admin).
-   **Direct Messages**: Private 1:1 conversations with other users.
-   **File Sharing**: Upload and share images, PDFs, and other files (powered by AWS S3).
<!-- -   **Emoji Reactions**: React to messages with emojis. -->
-   **Invite System**: Generate unique invite codes to grow your community.
-   **Authentication**: Secure login via Google (and other providers) using Better Auth.
-   **Responsive Design**: Fully responsive UI built with Tailwind CSS and Shadcn UI.
-   **Dark/Light Mode**: Themed interface for comfortable viewing.

## 🛠️ Tech Stack

### Frontend (`apps/web`)
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://shadcn.com/), [Lucide React](https://lucide.dev/) (Icons)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand), [TanStack Query](https://tanstack.com/query/latest)
-   **Real-time**: [Socket.io Client](https://socket.io/), [LiveKit](https://livekit.io/) (WebRTC)
-   **Forms**: React Hook Form, Zod
-   **Animations**: Framer Motion

### Backend (`apps/server`)
-   **Runtime**: [Bun](https://bun.sh/)
-   **Framework**: [Hono](https://hono.dev/)
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Authentication**: [Better Auth](https://better-auth.com/)
-   **Real-time**: Socket.io
-   **Storage**: AWS S3 (via AWS SDK)
-   **Validation**: Zod

### Monorepo & Tooling
-   **Monorepo Manager**: [TurboRepo](https://turbo.build/)
-   **Package Manager**: Bun

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18+)
-   [Bun](https://bun.sh/) (v1.0+)
-   [Docker](https://www.docker.com/) & Docker Compose

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/zJUNAIDz/relaycat.git
    cd relaycat
    ```

2.  **Install dependencies**
    ```bash
    bun install
    ```

3.  **Environment Setup**

    Create `.env` files in `apps/web` and `apps/server` based on the examples.

    **`apps/web/.env`**:
    ```env
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    NEXT_PUBLIC_API_URL=http://localhost:8000
    
    # LiveKit (for Voice/Video)
    NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
    LIVEKIT_API_KEY=your_api_key
    LIVEKIT_API_SECRET=your_api_secret
    ```

    **`apps/server/.env`**:
    ```env
    PORT=8000
    CLIENT_URL=http://localhost:3000
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/relaycat

    # Authentication (Better Auth)
    BETTER_AUTH_SECRET=your_secret_key
    BETTER_AUTH_URL=http://localhost:8000 # or your api url
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # AWS S3 (for Uploads)
    AWS_ACCESS_KEY_ID=your_access_key
    AWS_SECRET_ACCESS_KEY=your_secret_key
    AWS_REGION=your_region
    AWS_BUCKET_NAME=your_bucket_name
    ```

4.  **Start Infrastructure (Docker)**

    Use the provided `docker-compose.yml` to start the PostgreSQL database.

    Run the database:
    ```bash
    docker-compose up -d
    ```

5.  **Database Migration**

    Push the Drizzle schema to the database.

    ```bash
    # From root or apps/server
    cd apps/server
    bun run db:push
    ```

6.  **Run the Application**

    Start both the frontend and backend in development mode using Turbo.

    ```bash
    # From root
    bun run dev
    ```

    -   Frontend: [http://localhost:3000](http://localhost:3000)
    -   Backend: [http://localhost:8000](http://localhost:8000)

## 📂 Project Structure

```
relaycat/
├── apps/
│   ├── server/          # Hono backend API, Socket.io & Better Auth
│   │   ├── src/
│   │   │   ├── db/      # Drizzle ORM schema & config
│   │   │   ├── routes/  # API routes
│   │   │   ├── socket/  # Socket.io handlers
│   │   │   └── ...
│   └── web/             # Next.js frontend (Client)
│       ├── app/         # App Router pages & layouts
│       ├── components/  # Reusable UI components
│       ├── features/    # Feature-based modules (chat, server, etc.)
│       └── ...
├── packages/            # Shared packages (config, ui, etc.)
├── turbo.json           # TurboRepo configuration
└── package.json         # Root dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
