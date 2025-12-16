import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { state } from "./data.js";

const DATA_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "board.json");

let saveTimer = null;

export async function loadPersistedState() {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.notes)) state.notes = parsed.notes;
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") return;
    console.warn("⚠️ Error leyendo persistencia board.json", err);
  }
}

export function schedulePersist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const payload = JSON.stringify({ notes: state.notes }, null, 2);
      await writeFile(DATA_PATH, payload, "utf-8");
    } catch (err) {
      console.warn("⚠️ Error guardando persistencia board.json", err);
    }
  }, 200);
}
