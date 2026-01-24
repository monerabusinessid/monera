-- Create Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'application', 'message', 'job', 'talent_request', etc.
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT, -- URL to related resource
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at" DESC);

-- Add foreign key to profiles (if needed)
-- Note: This assumes profiles table exists
-- ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" 
-- FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON "notifications";
CREATE TRIGGER update_notifications_updated_at_trigger
    BEFORE UPDATE ON "notifications"
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();
