-- Initialize Cloudflare D1 Database
CREATE TABLE IF NOT EXISTS licenses (
  serial_number TEXT PRIMARY KEY,
  program_name TEXT,
  device_id TEXT,
  active INTEGER DEFAULT 0,
  activation_date TEXT,
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_active ON licenses(active);
CREATE INDEX IF NOT EXISTS idx_device_id ON licenses(device_id);
CREATE INDEX IF NOT EXISTS idx_activation_date ON licenses(activation_date);

