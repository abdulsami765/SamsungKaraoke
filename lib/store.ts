import fs from "fs"
import path from "path"

const DATA_DIR = path.resolve(process.cwd(), "data")
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json")

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function loadSessionsFromDisk(): any {
  try {
    ensureDataDir()
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}), "utf-8")
      return {}
    }

    const raw = fs.readFileSync(SESSIONS_FILE, "utf-8")
    return JSON.parse(raw || "{}")
  } catch (error) {
    console.error("Failed to load sessions from disk:", error)
    return {}
  }
}

export function saveSessionsToDisk(data: any) {
  try {
    ensureDataDir()
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error("Failed to save sessions to disk:", error)
  }
}

export default {
  loadSessionsFromDisk,
  saveSessionsToDisk,
}
