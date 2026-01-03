-- Add CRM tables for voice-to-CRM parser feature

-- Create enum types
CREATE TYPE "interaction_type" AS ENUM ('meeting', 'call', 'demo', 'email', 'other');
CREATE TYPE "deal_stage" AS ENUM ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost');

-- Create customers table
CREATE TABLE IF NOT EXISTS "infinitunes_customer" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "company" text NOT NULL,
    "email" text,
    "phone" text,
    "notes" text,
    "createdAt" timestamp NOT NULL DEFAULT NOW(),
    "updatedAt" timestamp NOT NULL DEFAULT NOW()
);

-- Create indexes for customers
CREATE INDEX IF NOT EXISTS "idx_customer_userId" ON "infinitunes_customer"("userId");
CREATE INDEX IF NOT EXISTS "idx_customer_name_company" ON "infinitunes_customer"(LOWER("name"), LOWER("company"));

-- Create deals table
CREATE TABLE IF NOT EXISTS "infinitunes_deal" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "customerId" uuid NOT NULL REFERENCES "infinitunes_customer"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "value" decimal(12, 2),
    "stage" "deal_stage" NOT NULL DEFAULT 'prospecting',
    "closeDate" timestamp,
    "description" text,
    "createdAt" timestamp NOT NULL DEFAULT NOW(),
    "updatedAt" timestamp NOT NULL DEFAULT NOW()
);

-- Create indexes for deals
CREATE INDEX IF NOT EXISTS "idx_deal_userId" ON "infinitunes_deal"("userId");
CREATE INDEX IF NOT EXISTS "idx_deal_customerId" ON "infinitunes_deal"("customerId");
CREATE INDEX IF NOT EXISTS "idx_deal_stage" ON "infinitunes_deal"("stage");

-- Create interactions table
CREATE TABLE IF NOT EXISTS "infinitunes_interaction" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "customerId" uuid NOT NULL REFERENCES "infinitunes_customer"("id") ON DELETE CASCADE,
    "dealId" uuid REFERENCES "infinitunes_deal"("id") ON DELETE SET NULL,
    "type" "interaction_type" NOT NULL,
    "summary" text NOT NULL,
    "keyPoints" text[] NOT NULL,
    "nextSteps" text[] NOT NULL,
    "followUpDate" timestamp,
    "transcribedFromVoice" text,
    "voiceNoteProcessed" text,
    "createdAt" timestamp NOT NULL DEFAULT NOW()
);

-- Create indexes for interactions
CREATE INDEX IF NOT EXISTS "idx_interaction_userId" ON "infinitunes_interaction"("userId");
CREATE INDEX IF NOT EXISTS "idx_interaction_customerId" ON "infinitunes_interaction"("customerId");
CREATE INDEX IF NOT EXISTS "idx_interaction_dealId" ON "infinitunes_interaction"("dealId");
CREATE INDEX IF NOT EXISTS "idx_interaction_type" ON "infinitunes_interaction"("type");
CREATE INDEX IF NOT EXISTS "idx_interaction_createdAt" ON "infinitunes_interaction"("createdAt");

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt
CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON "infinitunes_customer"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_updated_at BEFORE UPDATE ON "infinitunes_deal"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
