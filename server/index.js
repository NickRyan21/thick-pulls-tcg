import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
  res.json({ status: 'ok', service: 'thick-pulls-tcg' });
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const prompt = `Analyze this Pokemon trading card image and extract the following fields. Return ONLY a JSON object with these keys:
    - name: The Pokemon's name
    - card_number: The card number (e.g. "006/165")
    - set_name: The set/expansion name
    - year: The year printed on the card
    - rarity: The rarity level (Common, Uncommon, Rare, Holo Rare, Ultra Rare, Full Art, Alt Art, Secret Rare, etc.)
    - energy_type: The energy/type (Fire, Water, Grass, Lightning, Psychic, Fighting, Darkness, Metal, Dragon, Fairy, Colorless)
    - hp: The HP value as a number
    - parallel: Any parallel/variant info (e.g. "Reverse Holo", "Cosmos Holo") or empty string
    - language: The language of the card
    - is_first_edition: true/false

    If you cannot determine a field, use an empty string. Return valid JSON only.`;

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
  console.log(`Thick Pulls TCG server running on port ${PORT}`);
});
