-- Add composite indexes for fraud check queries
CREATE INDEX IF NOT EXISTS "entries_phone_created_at_idx" ON "entries" ("phone", "created_at");
CREATE INDEX IF NOT EXISTS "entries_ip_created_at_idx" ON "entries" ("ip", "created_at");
