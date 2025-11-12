# Norway Address Autocomplete

A **production-ready** address autocomplete built from the exercise prompt.  
Monorepo with a React (Vite) frontend and a Node.js (TypeScript, Express) API that searches a Norwegian address dataset using a trie.

**Live demo:** https://norway-address-autocomplete-f6bz.vercel.app/  
**Backend (Railway):** https://norway-address-autocomplete-production.up.railway.app

---

## Project Structure

/
├─ backend/ # Node.js + Express (TypeScript)
│ ├─ src/
│ │ ├─ index.ts # server entry (reads PORT, starts app)
│ │ ├─ app.ts # Express app + routes
│ │ ├─ services/
│ │ │ └─ addressService.ts # data loading + trie search
│ │ ├─ types.ts
│ │ ├─ app.test.ts, services/*.test.ts
│ ├─ data/addresses.json # dataset (checked in for demo; not for real prod)
│ ├─ package.json, tsconfig.json, jest.config.js
│
└─ frontend/ # React + Vite
├─ index.html
├─ src/
│ ├─ main.tsx, App.tsx
│ ├─ AddressSearch.tsx, AddressSearch.css
│ └─ types.ts
├─ package.json, tsconfig.json, vite.config.ts


---


## Key Technical Decisions

### Backend (Node.js + TypeScript)
- **Stack:** Express + TypeScript (`"strict": true`).
- **Search:** [`trie-search`](https://www.npmjs.com/package/trie-search) for fast prefix lookup of `street`.
- **Contract:** returns **up to 20** results; optional metadata via `?meta=1`.
- **Production touches:** env-driven config, async data load, clear error messages, CORS (configurable), tests (unit/integration), deployable on Railway.

### Frontend (React + Vite)
- **Stack:** React + TypeScript (no external UI libs for the search field).
- **DX:** Vite (fast dev/build).
- **UX/A11y:** keyboard navigation (↑/↓/Enter/Escape), `aria-*` roles (`combobox` / `listbox` / `option`), messages for loading/no results, debounce + optional `AbortController`.
- **Config:** API base URL via env (`VITE_API_BASE_URL`).

> **IE** is deprecated. We target modern evergreen browsers (Chrome, Firefox, Edge). Edge replaces IE for the requirement.

---

## API (Backend)

**Base URL (prod):** `https://norway-address-autocomplete-production.up.railway.app`

### `GET /`
Health check: `Backend server is running!`

### `GET /search/:query[?meta=1]`
- **Params**
  - `:query` — min 3 characters. Must be **URL-encoded** (`encodeURIComponent`).
  - `?meta=1` — if present, returns metadata.
- **Responses**
  - **Default (array)**  
    `200 OK` → `Address[]` (max 20)
  - **With `?meta=1` (object)**  
    `200 OK` → `{ items: Address[], total: number, limit: number }`
  - `400` if query length < 3  
  - `5xx` on internal errors

**Example**
```bash
# array form
curl "https://norway-address-autocomplete-production.up.railway.app/search/rod"

# metadata form
curl "https://norway-address-autocomplete-production.up.railway.app/search/rod?meta=1"

Address

type Address = {
  street: string;
  postNumber: number;
  city: string;
  county: string;
  district: string;
  municipality: string;
  municipalityNumber: number;
  type: string;
  typeCode: number;
};

Environment Variables
Backend (/backend)
Key	Example	Notes
PORT	8080	Railway injects it automatically
DATA_PATH	./data/addresses.json or absolute path	Where to read the dataset JSON

Local .env (optional)
Create backend/.env:

DATA_PATH=./data/addresses.json
PORT=8080

Frontend (/frontend)
Key	Example	Notes
VITE_API_BASE_URL	https://norway-address-autocomplete-production.up.railway.app	Consumed as import.meta.env.*

Local .env.local (optional)
Create frontend/.env.local:

VITE_API_BASE_URL=https://norway-address-autocomplete-production.up.railway.app

Running Locally
Backend
cd backend
npm ci
npm run build
# provide DATA_PATH (or use .env with dotenv)
DATA_PATH=./data/addresses.json node dist/index.js
# or for dev (ts-node):
npm run dev


Server listens on http://localhost:8080 by default.

Frontend
cd frontend
npm ci
npm run dev
# open http://localhost:5173

Deployment
Backend → Railway

Build Command:
bash -lc 'cd backend && npm ci && npm run build'

Start Command:
bash -lc 'cd backend && node dist/index.js' (avoid npm start in minimal runtimes)

Variables:
DATA_PATH=./backend/data/addresses.json
NODE_ENV=production

Expose to Internet to get https://<subdomain>.up.railway.app.

Frontend → Vercel

Root Directory: frontend

Build Command: npm run build

Output: dist

Env:
VITE_API_BASE_URL=https://norway-address-autocomplete-production.up.railway.app

Testing
Backend

Unit: trie/search, limit (max 20), error handling on invalid JSON.

Integration: API returns 400 on <3, array by default, object with ?meta=1.

Silencing logs in tests: jest.setup.js stubs console.* to keep output clean.

cd backend
npm test

Implementation Notes & Gotchas

URL Encoding: The frontend always uses encodeURIComponent(query) before calling /search/:query.

Race Conditions: Debounced calls use AbortController so older requests don’t overwrite newer results.

CORS: Currently permissive for ease of demo; lock down to your Vercel domain for production:

app.use(cors({
  origin: ['https://norway-address-autocomplete-f6bz.vercel.app'],
  methods: ['GET'],
}));


Dataset Size: Loaded once on startup into a trie. For very large datasets, consider streaming, pre-indexing, or a service/cache layer.

International chars: The API accepts URL-encoded UTF-8 (e.g., %C3%B8), so ø/å/æ work when encoded by the client.

Roadmap (nice-to-have)

Diacritic folding (e.g., search rodelokka → match Rodeløkka).

Pagination or “load more” beyond top-20.

Structured metrics and health endpoints (/healthz).

E2E tests (Playwright) covering keyboard UX and selection.

License

MIT — use freely for learning, interviews, or as a starter template.