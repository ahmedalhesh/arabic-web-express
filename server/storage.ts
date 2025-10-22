import Database from "better-sqlite3";
import type { License, InsertLicense } from "@shared/schema";
import { join } from "path";

export interface IStorage {
  // License operations
  getAllLicenses(): Promise<License[]>;
  getLicenseBySerial(serialNumber: string): Promise<License | undefined>;
  createLicense(license: InsertLicense): Promise<License>;
  updateLicense(serialNumber: string, license: InsertLicense): Promise<License>;
  deleteLicense(serialNumber: string): Promise<void>;
  activateLicense(serialNumber: string, deviceId: string): Promise<License>;
  resetLicenseActivation(serialNumber: string): Promise<License>;
}

export class SQLiteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    const dbPath = join(process.cwd(), "database.db");
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS licenses (
        serial_number TEXT PRIMARY KEY,
        program_name TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 0,
        device_id TEXT,
        activation_date TEXT,
        status TEXT NOT NULL,
        notes TEXT
      )
    `);
  }

  async getAllLicenses(): Promise<License[]> {
    const stmt = this.db.prepare("SELECT * FROM licenses ORDER BY serial_number");
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      active: Boolean(row.active),
    }));
  }

  async getLicenseBySerial(serialNumber: string): Promise<License | undefined> {
    const stmt = this.db.prepare("SELECT * FROM licenses WHERE serial_number = ?");
    const row = stmt.get(serialNumber) as any;
    if (!row) return undefined;
    return {
      ...row,
      active: Boolean(row.active),
    };
  }

  async createLicense(license: InsertLicense): Promise<License> {
    const stmt = this.db.prepare(`
      INSERT INTO licenses (serial_number, program_name, active, device_id, activation_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      license.serial_number,
      license.program_name,
      0, // active defaults to false
      null, // device_id defaults to null
      null, // activation_date defaults to null
      license.status,
      license.notes
    );

    return {
      serial_number: license.serial_number,
      program_name: license.program_name,
      active: false,
      device_id: null,
      activation_date: null,
      status: license.status,
      notes: license.notes,
    };
  }

  async updateLicense(serialNumber: string, license: InsertLicense): Promise<License> {
    const existing = await this.getLicenseBySerial(serialNumber);
    if (!existing) {
      throw new Error("License not found");
    }

    const stmt = this.db.prepare(`
      UPDATE licenses
      SET program_name = ?, status = ?, notes = ?
      WHERE serial_number = ?
    `);

    stmt.run(
      license.program_name,
      license.status,
      license.notes,
      serialNumber
    );

    return {
      ...existing,
      program_name: license.program_name,
      status: license.status,
      notes: license.notes,
    };
  }

  async activateLicense(serialNumber: string, deviceId: string): Promise<License> {
    const existing = await this.getLicenseBySerial(serialNumber);
    if (!existing) {
      throw new Error("License not found");
    }

    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const stmt = this.db.prepare(`
      UPDATE licenses
      SET active = 1, device_id = ?, activation_date = ?
      WHERE serial_number = ?
    `);

    stmt.run(deviceId, now, serialNumber);

    return {
      ...existing,
      active: true,
      device_id: deviceId,
      activation_date: now,
    };
  }

  async deleteLicense(serialNumber: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM licenses WHERE serial_number = ?");
    stmt.run(serialNumber);
  }

  async resetLicenseActivation(serialNumber: string): Promise<License> {
    const existing = await this.getLicenseBySerial(serialNumber);
    if (!existing) {
      throw new Error("License not found");
    }

    const stmt = this.db.prepare(`
      UPDATE licenses
      SET active = 0, device_id = NULL, activation_date = NULL
      WHERE serial_number = ?
    `);

    stmt.run(serialNumber);

    return {
      ...existing,
      active: false,
      device_id: null,
      activation_date: null,
    };
  }

  close() {
    this.db.close();
  }
}

export const storage = new SQLiteStorage();
