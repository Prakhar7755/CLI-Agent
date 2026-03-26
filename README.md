# AI CLI Agent

A powerful CLI-based AI assistant and modern web companion application that bridges the gap between your terminal and the browser. This project allows users to seamlessly authenticate via device-flow and interact with Google Gemini AI models directly from the command line, featuring chat persistence, tool execution, and an elegant UI.

## 🌟 Key Features

- **Device Flow Authentication:** Securely authenticate your CLI session by authorizing it through the Next.js web interface—powered by [Better Auth](https://github.com/better-auth/better-auth).
- **Multiple AI Modalities:**
  - **Chat:** A streamlined conversational AI experience.
  - **Tool Calling:** AI assistant that can utilize external commands (e.g., search, code execution).
  - **Agentic Mode:** Advanced autonomous behaviors (coming soon).
- **Persistent Conversations:** All chat histories and interactions are saved securely to a PostgreSQL database via [Prisma ORM](https://www.prisma.io/).
- **Beautiful Terminal Exerience:** Built with `@clack/prompts`, `chalk`, `boxen`, and `marked-terminal` for a polished, interactive, and beautifully formatted command-line interface.
- **Modern Web Interface:** A sleek dashboard built on Next.js 16 and React 19, styled effortlessly with Tailwind CSS v4 and `shadcn/ui`.

## 🏗️ Architecture

The monorepo-style project consists of two core applications:

- **Server (`/server`)**: A versatile Next-level backend running an Express server and the core CLI (`orbit`). It handles API routing, device-flow authentication loops, generative AI interactions using the Vercel AI SDK (`@ai-sdk/google`), and PostgreSQL database integrations.
- **Client (`/client`)**: The frontend web application serving as the visualization and authentication dashboard. Powered by Next.js, it manages the user-side of the device authorization flow.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A PostgreSQL database instance (e.g., local server or [Neon](https://neon.tech/))

### Installation

1. Clone the repository and navigate into the root directory.
2. Install dependencies for the root, server, and client concurrently:
   ```bash
   npm run install:all
   ```

### Environment Configuration

Configure the environment variables for both the server and the client.

**Server (`/server/.env`)**:
Copy `server/.env.example` to `server/.env` and update the values:

```env
PORT=3005
DATABASE_URL="your-postgresql-url"
BETTER_AUTH_SECRET="your-secure-secret"
BETTER_AUTH_URL="http://localhost:3005"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:3005"
```

**Client (`/client/.env`)**:
Copy `client/.env.example` to `client/.env` and update the values:

```env
CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:3005"
```

### Database Setup

Run Prisma migrations to construct your database schema:

```bash
cd server
npx prisma db push
```

## 🛠️ Usage

### Running Locally

To start the development servers, run the following commands in separate terminal sessions:

**Start the Backend (API Server):**

```bash
npm run dev:server
```

**Start the Frontend (Web Client):**

```bash
npm run dev:client
```

### Using the CLI Agent

The AI CLI tool is the main entry point to interacting with the agent. You can run the CLI from the root directory using:

```bash
npm run start:cli
```

Alternatively, you can link the CLI tool globally to your system:

```bash
cd server
npm link
```

_Now you can run the `orbit` command from anywhere!_

#### CLI Commands

- `orbit login` — Authenticates the CLI machine with your user account via the browser (Device Flow).
- `orbit logout` — Clears your current CLI authentication session.
- `orbit whoami` — Displays the currently authenticated user.
- `orbit wakeup` — Awakens the AI interface. Allows you to choose between standard chat and tool-calling modes.

## 🧑‍💻 Tech Stack

- **CLI / Backend:** Node.js, Express, Prisma, Better Auth, Vercel AI SDK, Commander, Clack.
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Lucide React, shadcn/ui.
- **Database:** PostgreSQL.

---

_Empower your terminal with context-aware AI interactions._
