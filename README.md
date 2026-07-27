# AlexFitnessHub Full-Stack Platform Documentation & Readme

Welcome to **AlexFitnessHub**, a production-grade, state-of-the-art interactive professional fitness platform. This system incorporates a responsive client-side React 18 application coupled with a high-performance Express.js server backend, supporting durable cloud persistence via Google Cloud Firestore and secure user authentication.

Additionally, this repository hosts an **Interactive Architecture & Live API Timing Bench** which is loaded natively on the frontend web interface, allowing anyone to monitor workspace server health, timing/latency distributions, and fire secure mock requests down to backend microservices!

---

## 🛠️ System Technology Stack

### 1. Front-End Architecture
- **Framework:** React 18 + Vite development/build bundling.
- **Styling:** Fully responsive Tailwind CSS layout.
- **Icons:** Modern vector glyphs provided by `lucide-react`.
- **Navigation Engine:** Frame-perfect state restoration scroll tracking with passive event requestAnimationFrame hooks to eliminate interface lag.

### 2. Back-End Architecture
- **Runtime:** Node.js v20+ with native TypeScript compiler stripping (`tsx`).
- **Server Gateway:** Express.js processing API requests, static file delivery, and custom proxies.
- **Durable File Caching System:** Asynchronous download manager translating remote GIF loops/videos to physical server directories (`/assets/`) to resolve expired web URL anchors.
- **Model Grounding Engine:** Secured Gemini AI integration layer powered by `@google/genai` with integrated high-demand rate recovery presets.

### 3. Database & Security
- **Cloud Database:** Google Cloud Firestore NoSQL SDK for atomic athlete stats and logs.
- **Token Authenticator:** Firebase Authentication processing encrypted session state keys.
- **Security Protocols:** Validated NoSQL rules guaranteeing user profile isolation.

---

## 📂 Core Repository Architecture

```text
├── server.ts                       # Multi-endpoint Express.js server (Port 3000)
├── firestore.rules                  # Firebase Firestore security schemas
├── firebase-blueprint.json          # Firestore collection and model configuration
├── package.json                    # Dependencies & operational scripts
├── assets/                         # Local workspace physical file store
├── src/
│   ├── App.tsx                     # Main switchboard and viewport anchor
│   ├── main.tsx                    # Client SPA compiler entry point
│   ├── index.css                   # Tailwind imports and theme variables
│   ├── types.ts                    # Global TypeScript model definitions
│   ├── components/                 # Reactive View Modules
│   │   ├── AppReadmeView.tsx       # Live UI Readme & API Timing Bench View
│   │   ├── Navbar.tsx            # Fluid header controller
│   │   ├── HomeView.tsx            # Marketing and pricing landing segment
│   │   ├── CoachView.tsx           # AI conversational chat channel
│   │   ├── NutritionView.tsx       # Dietary target and progress logger
│   │   └── WorkoutLibrary.tsx      # Training cards with active media uploaders
│   └── data/
│       ├── exercises.ts            # Compiled list of global training actions
│       └── custom_exercise_overrides.json # Local client configuration backups
```

---

## 🚀 Native Local Startup & Build

Ensure Node.js is installed locally, then execute:

### 1. Synchronize Dependencies
```bash
npm install
```

### 2. Boot Core Workspace (Port 3000)
In development, the Express server acts as a live proxy feeding client requests directly into Vite's middleware pipeline.
```bash
npm run dev
```

### 3. Production Compilation Build
```bash
npm run build
```
This single compile sequence bundles the front-end SPA into the clean local directory `dist/` and runs a bundle process utilizing `esbuild` to compile `server.ts` into a self-contained, high-performance ES Module file at `dist/index.js` for immediate deployment.

### 4. Boot Production Core
```bash
npm run start
```

---

## 📡 Dynamic API Endpoint Directory

| Method | Route | Description | Secure |
|:---|:---|:---|:---|
| **GET** | `/api/exercises/custom-media` | Loads customized fitness videos and uploads from local JSON storage. | Users |
| **POST** | `/api/exercises/save-custom-media` | Saves base64 media or parses, downloads, and mirrors external HTTP files to physical assets. | Users |
| **POST** | `/api/gemini/coach` | Submits contextual fitness prompts to Gemini with dynamic rule fail-safes. | Users |
| **POST** | `/api/gemini/quick-tip` | Analyzes historical athletic logs to compile biomechanical advice. | Users |

---

## 🛡️ Fire-Recovery Fail-Safes & Resiliency

To shield the end-user against intermittent AI quota constraints or model busy codes (**HTTP 429 / RESOURCE_EXHAUSTED** and **HTTP 503 / UNAVAILABLE**), `server.ts` incorporates dual operational catch structures. 

If a query fails, the backend immediately activates local descriptive rule systems. It calculates ideal training calories and formats real-world warmups relative to the target athlete's logged goals, preserving a continuous, professional application experience.

---

## 🔐 Advanced Security Safeguards

Inside `firestore.rules`, user partitions are programmatically locked down. Athletes are authorized to create or update their unique folders but are blocked from tampering with neighboring directories. Administration triggers, such as directly promoting athletes or editing global library databases, are locked strictly behind verified system administrative keys.
