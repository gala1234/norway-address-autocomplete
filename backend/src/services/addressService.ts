import TrieSearch from "trie-search";
import path from "path";
import { promises as fs } from "fs";
import type { Address, SearchPayload } from "../types";

const trie = new TrieSearch<Address>("street", {
  ignoreCase: true,
  min: 3,
});

// Data path resolution
export function resolveDataPath(): string {
  const envPath = process.env.DATA_PATH;

  if (envPath && path.isAbsolute(envPath)) return envPath;
  if (envPath) return path.resolve(process.cwd(), envPath);

  return path.resolve(process.cwd(), "data", "addresses.json");
}

export async function loadAndIndexAddresses(): Promise<void> {
  const dataPath = resolveDataPath();

  try {
    console.log(`[addressService] Loading address data from: ${dataPath}`);
    const raw = await fs.readFile(dataPath, "utf-8");

    // Basic JSON validation
    let addresses: Address[];

    try {
      addresses = JSON.parse(raw);
    } catch (e: any) {
      throw new Error(`Invalid JSON at ${dataPath}: ${e?.message ?? e}`);
    }

    // Rebuild trie
    if (typeof (trie as any).clear === "function") (trie as any).clear();
    trie.addAll(addresses);

    console.log(`[addressService] Indexed ${addresses.length} addresses`);

  } catch (err: any) {
    console.error(
      `[addressService] Failed to load or index data from ${dataPath}: ${
        err?.message ?? err
      }`
    );
    console.error(
      "[addressService] Hint: set DATA_PATH env var or place data/addresses.json under the project root."
    );
    throw err;
  }
}

export function searchAddressesWithMeta(
  query: string,
  limit = 20
): SearchPayload {
  const all = trie.get(query);
  return { items: all.slice(0, limit), total: all.length, limit };
}
