import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "database.db");

console.log("Database path:", dbPath);

let db: Database.Database;
try {
  db = new Database(dbPath);
  console.log("✅ Database connected successfully");
} catch (error) {
  console.error("❌ Database connection error:", error);
  throw error;
}

// Create licenses table
db.exec(`
  CREATE TABLE IF NOT EXISTS licenses (
    serial_number TEXT PRIMARY KEY,
    program_name TEXT,
    device_id TEXT,
    active INTEGER DEFAULT 0,
    activation_date TEXT,
    notes TEXT
  )
`);

export interface License {
  serial_number: string;
  program_name: string | null;
  device_id: string | null;
  active: number;
  activation_date: string | null;
  notes: string | null;
}

export const storage = {
  // Create new serial (admin generates)
  createSerial(serial: string, notes?: string): License {
    try {
      console.log("Creating serial:", serial, "with notes:", notes);
      const stmt = db.prepare(`
        INSERT INTO licenses (serial_number, notes, active)
        VALUES (?, ?, 0)
      `);
      const result = stmt.run(serial, notes || null);
      console.log("Insert result:", result);
      
      return {
        serial_number: serial,
        program_name: null,
        device_id: null,
        active: 0,
        activation_date: null,
        notes: notes || null,
      };
    } catch (error) {
      console.error("Error in createSerial:", error);
      throw error;
    }
  },

  // Activate serial (end user activates)
  activateSerial(serial: string, programName: string, deviceId: string): License | null {
    const license = this.getBySerial(serial);
    if (!license) return null;
    
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE licenses 
      SET program_name = ?, device_id = ?, active = 1, activation_date = ?
      WHERE serial_number = ?
    `);
    stmt.run(programName, deviceId, now, serial);
    
    return {
      ...license,
      program_name: programName,
      device_id: deviceId,
      active: 1,
      activation_date: now,
    };
  },

  // Get all licenses
  getAll(): License[] {
    const stmt = db.prepare(`
      SELECT * FROM licenses ORDER BY activation_date DESC
    `);
    return stmt.all() as License[];
  },

  // Get by serial
  getBySerial(serial: string): License | null {
    const stmt = db.prepare(`
      SELECT * FROM licenses WHERE serial_number = ?
    `);
    return stmt.get(serial) as License | null;
  },

  // Update notes only
  updateNotes(serial: string, notes: string): boolean {
    const stmt = db.prepare(`
      UPDATE licenses SET notes = ? WHERE serial_number = ?
    `);
    const result = stmt.run(notes, serial);
    return result.changes > 0;
  },

  // Delete serial
  delete(serial: string): boolean {
    const stmt = db.prepare(`
      DELETE FROM licenses WHERE serial_number = ?
    `);
    const result = stmt.run(serial);
    return result.changes > 0;
  },
};

