-- Migration 002: Complete schema for Pokemon TCG + eBay integration

-- ═══════════════════════════════════════════════════════════════════
-- USERS (with eBay OAuth + policy storage)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  -- eBay OAuth
  ebay_access_token TEXT,
  ebay_refresh_token TEXT,
  ebay_token_expiry TIMESTAMPTZ,
  ebay_refresh_expiry TIMESTAMPTZ,
  ebay_username TEXT,
  -- eBay business policies (created once per account)
  ebay_fulfillment_policy_id TEXT,
  ebay_return_policy_id TEXT,
  ebay_payment_policy_id TEXT,
  ebay_marketplace_id TEXT DEFAULT 'EBAY_US',
  ebay_default_starting_bid DECIMAL(10,2) DEFAULT 0.01,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- ADD MISSING COLUMNS TO CARDS
-- ═══════════════════════════════════════════════════════════════════

-- Pokemon identification
ALTER TABLE cards ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS pokedex_number INTEGER;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS illustrator TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS regulation_mark TEXT;

-- Card classification
ALTER TABLE cards ADD COLUMN IF NOT EXISTS card_category TEXT DEFAULT 'Pokemon';  -- Pokemon, Trainer, Energy
ALTER TABLE cards ADD COLUMN IF NOT EXISTS trainer_subtype TEXT;   -- Item, Supporter, Stadium, Tool
ALTER TABLE cards ADD COLUMN IF NOT EXISTS energy_subtype TEXT;    -- Basic, Special

-- Pokemon attributes
ALTER TABLE cards ADD COLUMN IF NOT EXISTS stage TEXT;             -- Basic, Stage 1, Stage 2, V, VMAX, VSTAR, ex, GX, etc.
ALTER TABLE cards ADD COLUMN IF NOT EXISTS finish TEXT;            -- Holo, Reverse Holo, Non-Holo, Full Art
ALTER TABLE cards ADD COLUMN IF NOT EXISTS weakness_type TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS weakness_modifier TEXT DEFAULT '×2';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS resistance_type TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS resistance_modifier TEXT DEFAULT '-30';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS retreat_cost INTEGER;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS evolves_from TEXT;

-- Edition / variant details
ALTER TABLE cards ADD COLUMN IF NOT EXISTS edition TEXT DEFAULT 'Unlimited';  -- 1st Edition, Shadowless, Unlimited
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_error_card BOOLEAN DEFAULT FALSE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS error_description TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT FALSE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS promo_number TEXT;

-- Grading extras
ALTER TABLE cards ADD COLUMN IF NOT EXISTS cert_number TEXT;       -- Slab certification number
ALTER TABLE cards ADD COLUMN IF NOT EXISTS bgs_sub_centering DECIMAL(3,1);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS bgs_sub_corners DECIMAL(3,1);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS bgs_sub_edges DECIMAL(3,1);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS bgs_sub_surface DECIMAL(3,1);

-- eBay item specifics
ALTER TABLE cards ADD COLUMN IF NOT EXISTS manufacturer TEXT DEFAULT 'The Pokémon Company';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS character_name TEXT;    -- Same as pokemon name, used for eBay aspect
ALTER TABLE cards ADD COLUMN IF NOT EXISTS features TEXT[];        -- Array: '1st Edition', 'Holographic', 'Shadowless', etc.
ALTER TABLE cards ADD COLUMN IF NOT EXISTS country_of_manufacture TEXT DEFAULT 'Japan';

-- eBay listing fields
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ebay_offer_id TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS listing_title TEXT;     -- Auto-generated for eBay
ALTER TABLE cards ADD COLUMN IF NOT EXISTS listing_description TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS listing_format TEXT DEFAULT 'FIXED_PRICE';  -- FIXED_PRICE or AUCTION
ALTER TABLE cards ADD COLUMN IF NOT EXISTS listing_duration TEXT DEFAULT 'GTC';        -- GTC, DAYS_1, DAYS_3, DAYS_5, DAYS_7, DAYS_10
ALTER TABLE cards ADD COLUMN IF NOT EXISTS auction_start_price DECIMAL(10,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS auction_reserve_price DECIMAL(10,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS scheduled_start_time TIMESTAMPTZ;           -- 7-day delay
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ebay_condition_code TEXT;  -- LIKE_NEW (graded) or USED_VERY_GOOD (ungraded)

-- Inventory / business
ALTER TABLE cards ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS storage_location TEXT;   -- e.g. "Binder 3, Page 5"
ALTER TABLE cards ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Image array (for multiple images including close-ups)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- ═══════════════════════════════════════════════════════════════════
-- ADDITIONAL LABEL SEEDS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO labels (category, name) VALUES
  -- Card categories
  ('card_category', 'Pokemon'),
  ('card_category', 'Trainer'),
  ('card_category', 'Energy'),
  -- Trainer subtypes
  ('trainer_subtype', 'Item'),
  ('trainer_subtype', 'Supporter'),
  ('trainer_subtype', 'Stadium'),
  ('trainer_subtype', 'Tool'),
  -- Stages
  ('stage', 'Basic'),
  ('stage', 'Stage 1'),
  ('stage', 'Stage 2'),
  ('stage', 'BREAK'),
  ('stage', 'Level X'),
  ('stage', 'Mega EX'),
  ('stage', 'GX'),
  ('stage', 'V'),
  ('stage', 'VMAX'),
  ('stage', 'VSTAR'),
  ('stage', 'ex'),
  ('stage', 'Radiant'),
  -- Finishes
  ('finish', 'Holo'),
  ('finish', 'Reverse Holo'),
  ('finish', 'Non-Holo'),
  ('finish', 'Full Art'),
  ('finish', 'Cosmos Holo'),
  -- Editions
  ('edition', '1st Edition'),
  ('edition', 'Shadowless'),
  ('edition', 'Unlimited'),
  -- Conditions (eBay aligned)
  ('condition', 'Mint'),
  ('condition', 'Near Mint'),
  ('condition', 'Lightly Played'),
  ('condition', 'Moderately Played'),
  ('condition', 'Heavily Played'),
  ('condition', 'Damaged'),
  -- Grading companies
  ('grading_company', 'PSA'),
  ('grading_company', 'BGS'),
  ('grading_company', 'CGC'),
  ('grading_company', 'SGC'),
  ('grading_company', 'ACE'),
  -- Additional rarities
  ('rarity', 'Double Rare'),
  ('rarity', 'Amazing Rare'),
  ('rarity', 'Radiant Rare'),
  ('rarity', 'Shiny Rare'),
  ('rarity', 'Shiny Ultra Rare'),
  ('rarity', 'ACE SPEC Rare'),
  -- Parallels
  ('parallel', 'Reverse Holo'),
  ('parallel', 'Cosmos Holo'),
  ('parallel', '1st Edition'),
  ('parallel', 'Shadowless'),
  ('parallel', 'Pre-Release Stamped'),
  ('parallel', 'Staff Promo'),
  ('parallel', 'Gold Border')
ON CONFLICT (category, name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- GENERATE SKU AUTOMATICALLY
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION generate_card_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL THEN
    NEW.sku := 'TPTCG-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || LEFT(NEW.id::TEXT, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_card_sku ON cards;
CREATE TRIGGER set_card_sku
  BEFORE INSERT ON cards
  FOR EACH ROW
  EXECUTE FUNCTION generate_card_sku();

-- ═══════════════════════════════════════════════════════════════════
-- AUTO-SET eBay CONDITION CODE
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION set_ebay_condition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_graded = TRUE THEN
    NEW.ebay_condition_code := 'LIKE_NEW';
  ELSE
    NEW.ebay_condition_code := 'USED_VERY_GOOD';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_ebay_condition ON cards;
CREATE TRIGGER auto_ebay_condition
  BEFORE INSERT OR UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION set_ebay_condition();

-- ═══════════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cards_updated_at ON cards;
CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
