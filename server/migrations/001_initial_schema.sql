-- Thick Pulls TCG - Initial Schema

-- Series (supports nesting: parent → sub-series)
CREATE TABLE IF NOT EXISTS series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES series(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labels (reusable lookup values: rarity, energy_type, parallel, language)
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'rarity', 'energy_type', 'parallel', 'language'
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, name)
);

-- Cards
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- Pokemon name
  card_number TEXT,                      -- e.g. "006/165"
  set_name TEXT,                         -- expansion/set name
  series_id UUID REFERENCES series(id),
  year TEXT,
  rarity TEXT,                           -- e.g. "Ultra Rare", "Secret Rare"
  card_type TEXT,                        -- e.g. "Pokemon", "Trainer", "Energy"
  energy_type TEXT,                      -- Fire, Water, Psychic, etc.
  hp INTEGER,
  parallel TEXT,                         -- variant: Reverse Holo, Cosmos, etc.
  condition TEXT DEFAULT 'Near Mint',
  language TEXT DEFAULT 'English',
  is_first_edition BOOLEAN DEFAULT FALSE,
  is_graded BOOLEAN DEFAULT FALSE,
  grading_company TEXT,
  grade TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  notes TEXT,
  -- eBay fields
  ebay_listing_id TEXT,
  ebay_status TEXT DEFAULT 'unlisted',   -- unlisted, scheduled, active, sold
  ebay_listing_type TEXT,                -- auction, buy_it_now
  ebay_price DECIMAL(10,2),
  ebay_sold_price DECIMAL(10,2),
  ebay_listed_at TIMESTAMPTZ,
  ebay_sold_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sets (groupings of cards for bulk management)
CREATE TABLE IF NOT EXISTS card_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  year TEXT,
  series_id UUID REFERENCES series(id),
  parallel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card-to-set association
CREATE TABLE IF NOT EXISTS card_set_members (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, set_id)
);

-- Seed default labels
INSERT INTO labels (category, name) VALUES
  ('rarity', 'Common'),
  ('rarity', 'Uncommon'),
  ('rarity', 'Rare'),
  ('rarity', 'Holo Rare'),
  ('rarity', 'Reverse Holo'),
  ('rarity', 'Ultra Rare'),
  ('rarity', 'Full Art'),
  ('rarity', 'Alt Art'),
  ('rarity', 'Secret Rare'),
  ('rarity', 'Gold'),
  ('rarity', 'Illustration Rare'),
  ('rarity', 'Special Illustration Rare'),
  ('rarity', 'Hyper Rare'),
  ('rarity', 'Trainer Gallery'),
  ('energy_type', 'Fire'),
  ('energy_type', 'Water'),
  ('energy_type', 'Grass'),
  ('energy_type', 'Lightning'),
  ('energy_type', 'Psychic'),
  ('energy_type', 'Fighting'),
  ('energy_type', 'Darkness'),
  ('energy_type', 'Metal'),
  ('energy_type', 'Dragon'),
  ('energy_type', 'Fairy'),
  ('energy_type', 'Colorless'),
  ('language', 'English'),
  ('language', 'Japanese'),
  ('language', 'Korean'),
  ('language', 'Chinese'),
  ('language', 'French'),
  ('language', 'German'),
  ('language', 'Spanish'),
  ('language', 'Italian'),
  ('language', 'Portuguese')
ON CONFLICT (category, name) DO NOTHING;
