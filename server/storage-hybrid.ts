// Hybrid Storage - Works with both SQLite (local) and D1 (production)
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "database.db");

export interface License {
  serial_number: string;
  program_name: string | null;
  device_id: string | null;
  active: number;
  activation_date: string | null;
  notes: string | null;
}

// D1 Storage for production
export const createD1Storage = (db: D1Database) => ({
  async createSerial(serial: string, notes?: string): Promise<License> {
    try {
      console.log("Creating serial:", serial, "with notes:", notes);
      
      await db.prepare(`
        INSERT INTO licenses (serial_number, notes, active)
        VALUES (?, ?, 0)
      `).bind(serial, notes || null).run();
      
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

  async activateSerial(serial: string, programName: string, deviceId: string): Promise<License | null> {
    const license = await this.getBySerial(serial);
    if (!license) return null;
    
    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE licenses 
      SET program_name = ?, device_id = ?, active = 1, activation_date = ?
      WHERE serial_number = ?
    `).bind(programName, deviceId, now, serial).run();
    
    return {
      ...license,
      program_name: programName,
      device_id: deviceId,
      active: 1,
      activation_date: now,
    };
  },

  async getAll(): Promise<License[]> {
    const result = await db.prepare(`
      SELECT * FROM licenses ORDER BY activation_date DESC
    `).all();
    return result.results as License[];
  },

  async getBySerial(serial: string): Promise<License | null> {
    const result = await db.prepare(`
      SELECT * FROM licenses WHERE serial_number = ?
    `).bind(serial).first();
    return result as License | null;
  },

  async updateNotes(serial: string, notes: string): Promise<boolean> {
    const result = await db.prepare(`
      UPDATE licenses SET notes = ? WHERE serial_number = ?
    `).bind(notes, serial).run();
    return result.changes > 0;
  },

  async delete(serial: string): Promise<boolean> {
    const result = await db.prepare(`
      DELETE FROM licenses WHERE serial_number = ?
    `).bind(serial).run();
    return result.changes > 0;
  },
});

// SQLite Storage for local development
let sqliteDb: Database.Database;
try {
  sqliteDb = new Database(dbPath);
  console.log("✅ SQLite Database connected successfully");
} catch (error) {
  console.error("❌ SQLite Database connection error:", error);
  throw error;
}

// Create licenses table for SQLite
sqliteDb.exec(`
  CREATE TABLE IF NOT EXISTS licenses (
    serial_number TEXT PRIMARY KEY,
    program_name TEXT,
    device_id TEXT,
    active INTEGER DEFAULT 0,
    activation_date TEXT,
    notes TEXT
  )
`);

export const sqliteStorage = {
  createSerial(serial: string, notes?: string): License {
    try {
      console.log("Creating serial:", serial, "with notes:", notes);
      const stmt = sqliteDb.prepare(`
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

  activateSerial(serial: string, programName: string, deviceId: string): License | null {
    const license = this.getBySerial(serial);
    if (!license) return null;
    
    const now = new Date().toISOString();
    const stmt = sqliteDb.prepare(`
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

  getAll(): License[] {
    const stmt = sqliteDb.prepare(`
      SELECT * FROM licenses ORDER BY activation_date DESC
    `);
    return stmt.all() as License[];
  },

  getBySerial(serial: string): License | null {
    const stmt = sqliteDb.prepare(`
      SELECT * FROM licenses WHERE serial_number = ?
    `);
    return stmt.get(serial) as License | null;
  },

  updateNotes(serial: string, notes: string): boolean {
    const stmt = sqliteDb.prepare(`
      UPDATE licenses SET notes = ? WHERE serial_number = ?
    `);
    const result = stmt.run(notes, serial);
    return result.changes > 0;
  },

  delete(serial: string): boolean {
    const stmt = sqliteDb.prepare(`
      DELETE FROM licenses WHERE serial_number = ?
    `);
    const result = stmt.run(serial);
    return result.changes > 0;
  },
};

// Export the appropriate storage based on environment
export const storage = process.env.NODE_ENV === 'production' 
  ? null // Will be set dynamically with D1
  : sqliteStorage;
