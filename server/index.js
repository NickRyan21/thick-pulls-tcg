import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://client-thick-rips.vercel.app',
    /\.vercel\.app$/,
  ],
}));
app.use(express.json());

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Multer for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'thick-rips-tcg' });
});
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── Auth ─────────────────────────────────────────────────────────

const ACCESS_KEY = process.env.ACCESS_KEY || 'CoziestMoss';

app.post('/api/auth/signup', async (req, res) => {
  const { access_key, username, password, email } = req.body;

  if (access_key !== ACCESS_KEY) {
    return res.status(403).json({ error: 'Invalid access key' });
  }
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Check if username taken
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ username, password_hash: password, email: email || null })
    .select('id, username, email')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ user: data });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, password_hash')
    .eq('username', username)
    .single();

  if (!data || error) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  if (data.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const { password_hash, ...user } = data;
  res.json({ user });
});

// ─── Cards ────────────────────────────────────────────────────────

// Get all cards
app.get('/api/cards', async (req, res) => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get single card
app.get('/api/cards/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Card not found' });
  res.json(data);
});

// Create card
app.post('/api/cards', async (req, res) => {
  const { data, error } = await supabase
    .from('cards')
    .insert(req.body)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Update card
app.put('/api/cards/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('cards')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete card
app.delete('/api/cards/:id', async (req, res) => {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Image Upload ─────────────────────────────────────────────────

app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const fileName = `${Date.now()}-${req.file.originalname}`;
  const { data, error } = await supabase.storage
    .from('card-images')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
    });

  if (error) return res.status(500).json({ error: error.message });

  const { data: urlData } = supabase.storage
    .from('card-images')
    .getPublicUrl(fileName);

  res.json({ url: urlData.publicUrl });
});

// ─── AI Scan ──────────────────────────────────────────────────────

app.post('/api/scan', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const prompt = `You are a Pokemon TCG card identification expert. Analyze this Pokemon trading card image and extract ALL of the following fields. Return ONLY a valid JSON object.

    CARD IDENTITY:
    - name: The Pokemon or card name exactly as printed (e.g. "Charizard", "Boss's Orders")
    - card_number: The collector number as printed (e.g. "006/165", "TG30/TG30")
    - set_name: The set/expansion name (e.g. "Obsidian Flames", "Scarlet & Violet 151")
    - year: The year printed on the card (bottom of card, e.g. "2024")
    - card_category: "Pokemon", "Trainer", or "Energy"
    - trainer_subtype: If Trainer card: "Item", "Supporter", "Stadium", or "Tool". Otherwise empty string.
    - energy_subtype: If Energy card: "Basic" or "Special". Otherwise empty string.

    RARITY & VARIANT:
    - rarity: Exact rarity (Common, Uncommon, Rare, Holo Rare, Double Rare, Ultra Rare, Full Art, Alt Art, Secret Rare, Illustration Rare, Special Illustration Rare, Hyper Rare, Gold, Trainer Gallery, Amazing Rare, Radiant Rare, Shiny Rare, ACE SPEC Rare)
    - finish: "Holo", "Reverse Holo", "Non-Holo", "Full Art", or "Cosmos Holo"
    - parallel: Any parallel/variant info (e.g. "Reverse Holo", "Cosmos Holo") or empty string
    - edition: "1st Edition" if 1st Ed stamp visible, "Shadowless" if no shadow on card border, otherwise "Unlimited"
    - is_first_edition: true/false

    POKEMON ATTRIBUTES (if card_category is Pokemon):
    - energy_type: Primary energy type (Fire, Water, Grass, Lightning, Psychic, Fighting, Darkness, Metal, Dragon, Fairy, Colorless)
    - hp: HP value as a number (e.g. 330)
    - stage: "Basic", "Stage 1", "Stage 2", "BREAK", "Level X", "Mega EX", "GX", "V", "VMAX", "VSTAR", "ex", or "Radiant"
    - weakness_type: Weakness energy type or empty string
    - resistance_type: Resistance energy type or empty string
    - retreat_cost: Number of retreat cost energy (0-5)
    - evolves_from: Pokemon it evolves from if shown, or empty string

    OTHER DETAILS:
    - illustrator: Artist name from bottom of card
    - regulation_mark: The regulation mark letter (D, E, F, G, H, I) from bottom-right of card, or empty string
    - language: Card language (English, Japanese, Korean, etc.)

    If you cannot determine a field, use an empty string for strings, null for numbers, false for booleans. Return valid JSON only, no markdown.`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Could not parse AI response' });

    const cardData = JSON.parse(jsonMatch[0]);
    res.json(cardData);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Failed to scan card' });
  }
});

// ─── Series ───────────────────────────────────────────────────────

app.get('/api/series', async (req, res) => {
  const { data, error } = await supabase
    .from('series')
    .select('*, sub_series:series!parent_id(*)')
    .is('parent_id', null)
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/series', async (req, res) => {
  const { data, error } = await supabase
    .from('series')
    .insert(req.body)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── Labels ───────────────────────────────────────────────────────

app.get('/api/labels', async (req, res) => {
  const { category } = req.query;
  let query = supabase.from('labels').select('*').order('name');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/labels', async (req, res) => {
  const { data, error } = await supabase
    .from('labels')
    .insert(req.body)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/labels/:id', async (req, res) => {
  const { error } = await supabase
    .from('labels')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Start ────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Thick Rips TCG server running on port ${PORT}`);
});
