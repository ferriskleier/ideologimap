import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'political-compass.db');
const db = new Database(dbPath);

// Create the people table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    wikipedia_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Person {
  id: number;
  name: string;
  x: number;
  y: number;
  wikipedia_url: string | null;
  created_at: string;
}

export function getAllPeople(): Person[] {
  const stmt = db.prepare('SELECT * FROM people');
  return stmt.all() as Person[];
}

export function getPerson(id: number): Person | undefined {
  const stmt = db.prepare('SELECT * FROM people WHERE id = ?');
  return stmt.get(id) as Person | undefined;
}

export function addPerson(name: string, x: number, y: number, wikipedia_url?: string): Person {
  const stmt = db.prepare('INSERT INTO people (name, x, y, wikipedia_url) VALUES (?, ?, ?, ?)');
  const info = stmt.run(name, x, y, wikipedia_url || null);
  return getPerson(info.lastInsertRowid as number)!;
}

export function updatePerson(id: number, x: number, y: number): void {
  const stmt = db.prepare('UPDATE people SET x = ?, y = ? WHERE id = ?');
  stmt.run(x, y, id);
}

export function deletePerson(id: number): void {
  const stmt = db.prepare('DELETE FROM people WHERE id = ?');
  stmt.run(id);
}

export function personExists(name: string): boolean {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM people WHERE LOWER(name) = LOWER(?)');
  const result = stmt.get(name) as { count: number };
  return result.count > 0;
}

// Initialize with Ayn Rand if the database is empty
const peopleCount = db.prepare('SELECT COUNT(*) as count FROM people').get() as { count: number };
if (peopleCount.count === 0) {
  addPerson('Ayn Rand', 8, -8, 'https://en.wikipedia.org/wiki/Ayn_Rand');
}

export default db;