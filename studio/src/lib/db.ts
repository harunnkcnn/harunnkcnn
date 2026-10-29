import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

const locks = new Map<string, Promise<unknown>>();

/** Aynı dosyaya yazan işlemleri sıraya sokar (yarış durumunu önler). */
function serial<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(file) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(file, next.catch(() => undefined));
  return next;
}

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(name: string, value: T): Promise<void> {
  const file = path.join(DATA_DIR, `${name}.json`);
  return serial(file, async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${file}.${randomUUID()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
    await fs.rename(tmp, file);
  });
}

/** Okuma-değiştirme-yazma işlemini atomik yapar. */
export function updateJson<T>(name: string, fallback: T, mutate: (current: T) => T): Promise<T> {
  const file = path.join(DATA_DIR, `${name}.json`);
  return serial(file, async () => {
    const current = await readJson<T>(name, fallback);
    const next = mutate(current);
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${file}.${randomUUID()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, file);
    return next;
  });
}

export const uid = () => randomUUID().slice(0, 8);
