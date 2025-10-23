// Cloudflare D1 Database Storage
// This file will be used for production deployment

export interface License {
  serial_number: string;
  program_name: string | null;
  device_id: string | null;
  active: number;
  activation_date: string | null;
  notes: string | null;
}

export const createD1Storage = (db: D1Database) => ({
  // Create new serial (admin generates)
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

  // Activate serial (end user activates)
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

  // Get all licenses
  async getAll(): Promise<License[]> {
    const result = await db.prepare(`
      SELECT * FROM licenses ORDER BY activation_date DESC
    `).all();
    return result.results as License[];
  },

  // Get by serial
  async getBySerial(serial: string): Promise<License | null> {
    const result = await db.prepare(`
      SELECT * FROM licenses WHERE serial_number = ?
    `).bind(serial).first();
    return result as License | null;
  },

  // Update notes only
  async updateNotes(serial: string, notes: string): Promise<boolean> {
    const result = await db.prepare(`
      UPDATE licenses SET notes = ? WHERE serial_number = ?
    `).bind(notes, serial).run();
    return result.changes > 0;
  },

  // Delete serial
  async delete(serial: string): Promise<boolean> {
    const result = await db.prepare(`
      DELETE FROM licenses WHERE serial_number = ?
    `).bind(serial).run();
    return result.changes > 0;
  },
});
