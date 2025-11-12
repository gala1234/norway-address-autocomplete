import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import {
  loadAndIndexAddresses,
  searchAddressesWithMeta,
} from "./services/addressService";

const app = express();

app.use(cors());

// For production, restrict CORS to specific origins
// app.use(cors({ origin: [/^https:\/\/(www\.)?mydomain\.com$/], methods: ["GET"] }));

app.use(express.json());

// --- Data Loading ---
// Load and index data on server startup (asynchronously)
loadAndIndexAddresses().catch((err) => {
  console.error("[app] Fatal: could not initialize address index.", err);
  process.exit(1);
});

// --- API Routes ---
app.get("/", (req: Request, res: Response) => {
  res.send("Backend server is running!");
});

/**
 * Address search endpoint
 */
app.get("/search/:query", (req: Request, res: Response) => {
  const query = (req.params.query ?? "").trim();
  if (query.length < 3)
    return res
      .status(400)
      .json({ error: "Search query must be at least 3 characters long." });

  try {
    const meta = String(req.query.meta ?? "").toLowerCase();
    const payload = searchAddressesWithMeta(query, 20);

    if (meta === "1" || meta === "true") return res.json(payload);

    return res.json(payload.items);
  } catch (err) {
    console.error("Error during search:", err);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
});

export default app;
