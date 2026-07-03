# AkselLearn — Frontend Client

A high-performance modern web application built for the AkselLearn LMS platform. It serves both the public-facing student platform and the administrative dashboard.

## Tech Stack

- **Language:** TypeScript
- **Runtime / Package Manager:** [Bun](https://bun.sh/)
- **Framework:** React 19 (via Vite)
- **Routing:** TanStack Router (Type-safe routing)
- **State & Data Fetching:** Zustand, TanStack Query
- **Styling:** Tailwind CSS v4, shadcn/ui (Radix UI)
- **Forms & Validation:** React Hook Form, Zod
- **Backend Proxy:** Nitro (H3)
- **Video Player:** Plyr with HLS.js
- **Rich Text Editor:** Tiptap

---

## Local Development

### Prerequisites

To run the project locally, you will need:
- [Bun](https://bun.sh/) 1.1+ (Strictly enforced, do not use `npm` or `yarn`)
- [Node.js](https://nodejs.org/) 20.0+

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone git@github.com:akselerasiindonesia/aksellearn-client.git
   cd aksellearn-client
   ```

2. **Install Dependencies:**
   ```bash
   bun install
   ```

3. **Configure Environment:**
   Copy the example environment file and configure it to point to your local Go backend.
   ```bash
   cp .env.example .env
   ```
   > **Note:** Ensure `VITE_API_URL` points to your backend (e.g., `http://localhost:3000`).

4. **Run the Application:**
   Start the Vite development server on port 2000:
   ```bash
   bun dev
   ```

---

## Docker Development

For testing the production build locally or running in a containerized environment, you can use the provided Docker configurations.

### Build the Image
```bash
bun run docker:build
```

### Run with Docker Compose
To run the frontend alongside the proxy using the production settings:
```bash
bun run docker:run
```
To stop the containers:
```bash
bun run docker:stop
```

---

## Project Structure

```text
mc-clara-fe/
├── public/           # Static assets (images, fonts, etc.)
├── scripts/          # Automation and deployment scripts (e.g., sync-client.ps1)
├── src/              
│   ├── components/   # Reusable UI components (shadcn, forms, layout)
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities, API client configurations
│   ├── routes/       # TanStack Router route definitions
│   ├── server/       # Nitro API Proxy (api-proxy.ts)
│   ├── store/        # Zustand state stores
│   └── types/        # Global TypeScript interfaces
├── strategies/       # Internal development and delivery documentation
├── Dockerfile        # Production Dockerfile
└── vite.config.ts    # Vite configuration
```

---

## Architecture Notes

### API Proxy (Nitro)
All requests to the backend are routed through a Nitro-powered proxy (`/api-proxy/*`) defined in `src/server/api-proxy.ts`. This proxy handles request signing, header sanitization, and streaming large multipart files directly to the Go backend.

---

## Deployment & Production

### Delivery Strategy
This repository contains internal AI workflows, debugging artifacts, and strategy documents that are **not** pushed directly to the client's repository. 

To deliver a feature to the client repository:
1. Ensure the `aksellearn-fe-delivery` worktree is set up.
2. Run the sync script to mirror the clean source code:
   ```powershell
   .\scripts\sync-client.ps1 -CommitMessage "feat: your feature here"
   ```
3. Push to the client's repository from the delivery worktree.
4. For full details, read `strategies/delivery/repository.md`.

### Production Build
To create a static build for production deployment:
```bash
bun run build
```
