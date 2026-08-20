import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const DATA_DIR = path.join(process.cwd(), "data");

// Key prefix to namespace this project's data in Upstash Redis
const REDIS_KEY_PREFIX = "aifoundry:";

// ---- Redis Client (lazy-init, null if not configured) ----
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
    return redis;
  }
  return null;
}

// ---- Local file helpers ----
function ensureDir(dir: string) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {
    /* read-only FS in serverless */
  }
}

function readLocalJSON<T>(filename: string, defaultValue: T): T {
  ensureDir(DATA_DIR);
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
    }
  } catch (e) {
    console.error(`[local-db] Error reading ${filename}:`, e);
  }
  return defaultValue;
}

function writeLocalJSON<T>(filename: string, data: T): boolean {
  ensureDir(DATA_DIR);
  try {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false; // read-only FS on serverless
  }
}

// ---- Public Async API (Redis-first with Local JSON fallback) ----

/**
 * Read data: tries Redis first, falls back to local JSON.
 * On first Redis read (cache miss), seeds Redis from local JSON automatically.
 */
export async function readData<T>(filename: string, defaultValue: T): Promise<T> {
  const kv = getRedis();
  if (kv) {
    try {
      const redisKey = `${REDIS_KEY_PREFIX}${filename}`;
      const cached = await kv.get<T>(redisKey);
      if (cached !== null && cached !== undefined) return cached;

      // Cache miss - seed from local JSON file
      const local = readLocalJSON(filename, defaultValue);
      try {
        await kv.set(redisKey, local);
      } catch {
        /* seed failed, OK */
      }
      return local;
    } catch (err) {
      console.error(`[cloud-db] Redis read error for ${filename}:`, err);
    }
  }
  // No Redis configured or error -> use local file
  return readLocalJSON(filename, defaultValue);
}

/**
 * Write data: writes to Redis (primary) and local FS (best-effort).
 */
export async function writeData<T>(filename: string, data: T): Promise<boolean> {
  const kv = getRedis();
  let kvOk = false;

  if (kv) {
    try {
      await kv.set(`${REDIS_KEY_PREFIX}${filename}`, data);
      kvOk = true;
    } catch (err) {
      console.error(`[cloud-db] Redis write error for ${filename}:`, err);
    }
  }

  // Also write local (works in local dev, fails gracefully on Vercel)
  const localOk = writeLocalJSON(filename, data);

  return kvOk || localOk;
}

// ---- File upload utility for local dev & assets ----
export function saveUploadedFile(
  fileBuffer: Buffer,
  originalName: string,
  subfolder: string = "general"
): string | null {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", subfolder);
  try {
    ensureDir(uploadsDir);
    const ext = path.extname(originalName) || ".png";
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, uniqueName), fileBuffer);
    return `/uploads/${subfolder}/${uniqueName}`;
  } catch {
    return null;
  }
}

export function deleteUploadedFile(publicUrl: string): boolean {
  try {
    const filePath = path.join(process.cwd(), "public", publicUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
