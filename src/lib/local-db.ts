import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const DATA_DIR = path.join(process.cwd(), "data");

// Key prefix to namespace this project's data in Upstash Redis
// Overridable so end-to-end tests can run against a real Redis in an isolated keyspace.
const REDIS_KEY_PREFIX = process.env.REDIS_KEY_PREFIX || "aifoundry:";

// ---- In-memory cache fallback for serverless instances ----
// On globalThis: each route is its own bundle, and a module-level Map would give every route a
// separate (stale) copy of the data in local mode.
const globalForStore = globalThis as unknown as { __aifMemoryStore?: Map<string, any> };
const memoryStore = (globalForStore.__aifMemoryStore ??= new Map<string, any>());

// ---- Redis Client (lazy-init, null if not configured) ----
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const rawUrl =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_URL ||
    "";
  const rawToken =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_TOKEN ||
    "";

  const url = rawUrl.trim();
  const token = rawToken.trim();

  if (url && token) {
    try {
      redis = new Redis({ url, token });
      return redis;
    } catch (e) {
      console.warn("[local-db] Failed to initialize Upstash Redis:", e);
    }
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
  if (memoryStore.has(filename)) {
    return memoryStore.get(filename) as T;
  }
  ensureDir(DATA_DIR);
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
      memoryStore.set(filename, parsed);
      return parsed;
    }
  } catch (e) {
    console.error(`[local-db] Error reading ${filename}:`, e);
  }
  return defaultValue;
}

function writeLocalJSON<T>(filename: string, data: T): boolean {
  memoryStore.set(filename, data);
  ensureDir(DATA_DIR);
  try {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false; // read-only FS on serverless (memoryStore retains state in warm instance)
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

// ---- Atomic record collections ----
// Whole-file read-modify-write loses data when two requests write at once (votes, scores, logins).
// Collections store one record per Redis hash field, so every write touches only its own record.
// Locally the same JSON array files are used; mutations run synchronously on the shared in-memory
// array (no await between check and write), which is atomic within the single dev process.

export interface CollectionSpec<T> {
  /** Local JSON filename; also names the Redis hash. */
  name: string;
  /** Field key. Records with the same key are the same record (this is what makes uniqueness atomic). */
  keyOf: (record: T) => string;
  /** One-time seed when the collection is first used. Defaults to the legacy JSON blob of the same name. */
  seed?: () => Promise<T[]>;
}

const hashKey = (name: string) => `${REDIS_KEY_PREFIX}h:${name}`;
const listKey = (name: string) => `${REDIS_KEY_PREFIX}l:${name}`;
const seededMarker = (key: string) => `${REDIS_KEY_PREFIX}seeded:${key}`;
const seeded = new Set<string>();

async function seedRows<T>(spec: CollectionSpec<T>): Promise<T[]> {
  return spec.seed ? spec.seed() : readData<T[]>(spec.name, []);
}

async function ensureHashSeeded<T>(kv: Redis, spec: CollectionSpec<T>): Promise<void> {
  const key = hashKey(spec.name);
  if (seeded.has(key)) return;
  if (!(await kv.get(seededMarker(key)))) {
    const rows = await seedRows(spec);
    if (rows.length > 0) {
      // HSETNX: idempotent if two instances seed at once, and never clobbers newer writes.
      const pipe = kv.pipeline();
      for (const row of rows) pipe.hsetnx(key, spec.keyOf(row), row);
      await pipe.exec();
    }
    await kv.set(seededMarker(key), Date.now());
  }
  seeded.add(key);
}

/** Local mode: returns the shared in-memory array for the collection (seeded on first use). */
async function localRows<T>(spec: CollectionSpec<T>): Promise<T[]> {
  if (!memoryStore.has(spec.name)) {
    if (fs.existsSync(path.join(DATA_DIR, spec.name))) {
      readLocalJSON<T[]>(spec.name, []); // caches the parsed file in memoryStore
    } else {
      const rows = await seedRows(spec);
      if (!memoryStore.has(spec.name)) writeLocalJSON(spec.name, rows);
    }
  }
  const rows = memoryStore.get(spec.name);
  if (!Array.isArray(rows)) {
    // Never overwrite a file we couldn't parse: surface it instead of silently resetting data.
    throw new Error(`[local-db] data/${spec.name} is not a valid JSON array`);
  }
  return rows as T[];
}

export async function listRecords<T>(spec: CollectionSpec<T>): Promise<T[]> {
  const kv = getRedis();
  if (kv) {
    await ensureHashSeeded(kv, spec);
    const all = await kv.hgetall<Record<string, T>>(hashKey(spec.name));
    return all ? Object.values(all) : [];
  }
  return structuredClone(await localRows(spec));
}

export async function getRecord<T>(spec: CollectionSpec<T>, key: string): Promise<T | null> {
  const kv = getRedis();
  if (kv) {
    await ensureHashSeeded(kv, spec);
    return (await kv.hget<T>(hashKey(spec.name), key)) ?? null;
  }
  const found = (await localRows(spec)).find((r) => spec.keyOf(r) === key);
  return found ? structuredClone(found) : null;
}

/** Upserts records; each record is written independently (no lost updates between writers). */
export async function putRecords<T>(spec: CollectionSpec<T>, records: T[]): Promise<boolean> {
  if (records.length === 0) return true;
  const kv = getRedis();
  if (kv) {
    await ensureHashSeeded(kv, spec);
    await kv.hset(hashKey(spec.name), Object.fromEntries(records.map((r) => [spec.keyOf(r), r])));
    return true;
  }
  const rows = await localRows(spec);
  for (const record of records) {
    const idx = rows.findIndex((r) => spec.keyOf(r) === spec.keyOf(record));
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
  }
  writeLocalJSON(spec.name, rows);
  return true;
}

/** Inserts only if no record has this key. Returns false if one already exists. Atomic (HSETNX). */
export async function insertRecordIfAbsent<T>(spec: CollectionSpec<T>, record: T): Promise<boolean> {
  const key = spec.keyOf(record);
  const kv = getRedis();
  if (kv) {
    await ensureHashSeeded(kv, spec);
    return (await kv.hsetnx(hashKey(spec.name), key, record)) === 1;
  }
  const rows = await localRows(spec);
  if (rows.some((r) => spec.keyOf(r) === key)) return false;
  rows.push(record);
  writeLocalJSON(spec.name, rows);
  return true;
}

export async function deleteRecords<T>(spec: CollectionSpec<T>, keys: string[]): Promise<boolean> {
  if (keys.length === 0) return true;
  const kv = getRedis();
  if (kv) {
    await ensureHashSeeded(kv, spec);
    await kv.hdel(hashKey(spec.name), ...keys);
    return true;
  }
  const doomed = new Set(keys);
  const rows = await localRows(spec);
  const kept = rows.filter((r) => !doomed.has(spec.keyOf(r)));
  rows.length = 0;
  rows.push(...kept); // mutate in place so concurrent holders of the array see the deletion
  writeLocalJSON(spec.name, rows);
  return true;
}

// ---- Append-only capped logs (newest first) ----

export interface LogSpec<T> {
  /** Local JSON filename and Redis list name. */
  name: string;
  max: number;
  seed?: () => Promise<T[]>;
}

async function ensureListSeeded<T>(kv: Redis, spec: LogSpec<T>): Promise<void> {
  const key = listKey(spec.name);
  if (seeded.has(key)) return;
  // Lists aren't idempotent to seed, so exactly one instance wins the marker and seeds.
  if (await kv.set(seededMarker(key), Date.now(), { nx: true })) {
    const rows = (spec.seed ? await spec.seed() : await readData<T[]>(spec.name, [])).slice(0, spec.max);
    if (rows.length > 0) await kv.rpush(key, ...rows); // legacy arrays are newest-first already
  }
  seeded.add(key);
}

export async function pushLog<T>(spec: LogSpec<T>, entry: T): Promise<void> {
  const kv = getRedis();
  if (kv) {
    await ensureListSeeded(kv, spec);
    const key = listKey(spec.name);
    await kv.pipeline().lpush(key, entry).ltrim(key, 0, spec.max - 1).exec();
    return;
  }
  const rows = await localRows<T>({ name: spec.name, keyOf: () => "", seed: spec.seed });
  rows.unshift(entry);
  if (rows.length > spec.max) rows.length = spec.max;
  writeLocalJSON(spec.name, rows);
}

export async function readLog<T>(spec: LogSpec<T>): Promise<T[]> {
  const kv = getRedis();
  if (kv) {
    await ensureListSeeded(kv, spec);
    return kv.lrange<T>(listKey(spec.name), 0, spec.max - 1);
  }
  return structuredClone(await localRows<T>({ name: spec.name, keyOf: () => "", seed: spec.seed }));
}

/** Removes matching entries (rare admin operation). */
export async function removeFromLog<T>(spec: LogSpec<T>, match: (entry: T) => boolean): Promise<void> {
  const kv = getRedis();
  if (kv) {
    const key = listKey(spec.name);
    for (const entry of (await readLog(spec)).filter(match)) {
      await kv.lrem(key, 1, entry); // same JSON serialization as the stored value
    }
    return;
  }
  const rows = await localRows<T>({ name: spec.name, keyOf: () => "", seed: spec.seed });
  const kept = rows.filter((r) => !match(r));
  rows.length = 0;
  rows.push(...kept);
  writeLocalJSON(spec.name, rows);
}

export async function clearLog<T>(spec: LogSpec<T>): Promise<void> {
  const kv = getRedis();
  if (kv) {
    await ensureListSeeded(kv, spec); // mark seeded first, or a later call would re-import legacy rows
    await kv.del(listKey(spec.name));
    return;
  }
  const rows = await localRows<T>({ name: spec.name, keyOf: () => "", seed: spec.seed });
  rows.length = 0;
  writeLocalJSON(spec.name, rows);
}

// ---- Change counter (drives live updates) ----
const globalForVersion = globalThis as unknown as { __aifVersions?: Map<string, number> };
const localVersions = (globalForVersion.__aifVersions ??= new Map<string, number>());

export async function bumpVersion(name: string): Promise<number> {
  const kv = getRedis();
  if (kv) return kv.incr(`${REDIS_KEY_PREFIX}version:${name}`);
  const next = (localVersions.get(name) ?? 0) + 1;
  localVersions.set(name, next);
  return next;
}

export async function readVersion(name: string): Promise<number> {
  const kv = getRedis();
  if (kv) return Number((await kv.get(`${REDIS_KEY_PREFIX}version:${name}`)) ?? 0);
  return localVersions.get(name) ?? 0;
}

// ---- File upload utility for local dev & assets (Path-Traversal & Extension Hardened) ----
const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".gif",
  ".avif",
  ".pdf",
  ".mp4",
  ".webm",
]);

export function saveUploadedFile(
  fileBuffer: Buffer,
  originalName: string,
  subfolder: string = "general"
): string | null {
  // Sanitize subfolder to alphanumeric and hyphens only (prevent path traversal)
  const safeSubfolder = subfolder.replace(/[^a-zA-Z0-9-_]/g, "") || "general";
  const uploadsDir = path.join(process.cwd(), "public", "uploads", safeSubfolder);

  try {
    ensureDir(uploadsDir);

    let ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      ext = ".png"; // Force safe extension if unauthorized or suspicious
    }

    const rawBaseName = path.basename(originalName, path.extname(originalName));
    const baseName = rawBaseName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50) || "upload";
    const uniqueName = `${baseName}-${Date.now()}${ext}`;

    const destinationPath = path.join(uploadsDir, uniqueName);

    // Verify resolved path is strictly within uploadsDir
    if (!destinationPath.startsWith(path.join(process.cwd(), "public", "uploads"))) {
      return null;
    }

    fs.writeFileSync(destinationPath, fileBuffer);
    return `/uploads/${safeSubfolder}/${uniqueName}`;
  } catch (err) {
    console.error("[local-db] Upload error:", err);
    return null;
  }
}

export function deleteUploadedFile(publicUrl: string): boolean {
  try {
    // Only allow deletion within public/uploads/
    const cleanRelative = path.normalize(publicUrl).replace(/^(\.\.[\/\\])+/, "");
    if (!cleanRelative.startsWith("/uploads/") && !cleanRelative.startsWith("uploads/")) {
      return false;
    }

    const filePath = path.join(process.cwd(), "public", cleanRelative);
    const expectedBase = path.join(process.cwd(), "public", "uploads");

    if (!filePath.startsWith(expectedBase)) {
      return false; // Prevent path traversal
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
