import React, { useState, useRef } from 'react';
import { API_URL } from '../config';

const RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Holo Rare', 'Reverse Holo',
  'Double Rare', 'Ultra Rare', 'Full Art', 'Alt Art', 'Secret Rare',
  'Illustration Rare', 'Special Illustration Rare', 'Hyper Rare',
  'Gold', 'Trainer Gallery', 'Amazing Rare', 'Radiant Rare',
  'Shiny Rare', 'Shiny Ultra Rare', 'ACE SPEC Rare',
];
const CONDITIONS = ['Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];
const ENERGY_TYPES = ['Fire', 'Water', 'Grass', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Fairy', 'Colorless'];
const STAGES = ['Basic', 'Stage 1', 'Stage 2', 'BREAK', 'Level X', 'Mega EX', 'GX', 'V', 'VMAX', 'VSTAR', 'ex', 'Radiant'];
const FINISHES = ['Holo', 'Reverse Holo', 'Non-Holo', 'Full Art', 'Cosmos Holo'];
const EDITIONS = ['Unlimited', '1st Edition', 'Shadowless'];
const CARD_CATEGORIES = ['Pokemon', 'Trainer', 'Energy'];
const TRAINER_SUBTYPES = ['Item', 'Supporter', 'Stadium', 'Tool'];
const ENERGY_SUBTYPES = ['Basic', 'Special'];
const LANGUAGES = ['English', 'Japanese', 'Korean', 'Chinese Traditional', 'Chinese Simplified', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Polish', 'Dutch', 'Thai', 'Indonesian'];

export default function AddCardModal({ onClose, onSave }) {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    // Core identity
    name: '',
    card_number: '',
    set_name: '',
    year: '',
    // Classification
    card_category: 'Pokemon',
    trainer_subtype: '',
    energy_subtype: '',
    rarity: '',
    stage: '',
    finish: '',
    edition: 'Unlimited',
    // Pokemon attributes
    energy_type: '',
    hp: '',
    weakness_type: '',
    resistance_type: '',
    retreat_cost: '',
    evolves_from: '',
    // Details
    parallel: '',
    language: 'English',
    illustrator: '',
    regulation_mark: '',
    character_name: '',
    // Condition
    condition: 'Near Mint',
    is_graded: false,
    grading_company: '',
    grade: '',
    cert_number: '',
    // Flags
    is_first_edition: false,
    is_promo: false,
    promo_number: '',
    is_error_card: false,
    error_description: '',
    // Business
    purchase_price: '',
    storage_location: '',
    notes: '',
  });
  const frontInputRef = useRef();
  const backInputRef = useRef();

  const handleImageUpload = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === 'front') setFrontImage({ file, url });
    else setBackImage({ file, url });
  };

  const handleScan = async () => {
    if (!frontImage) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', frontImage.file);
      const res = await fetch(`${API_URL}/api/scan`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          card_number: data.card_number || prev.card_number,
          set_name: data.set_name || prev.set_name,
          year: data.year || prev.year,
          rarity: data.rarity || prev.rarity,
          energy_type: data.energy_type || prev.energy_type,
          hp: data.hp || prev.hp,
          parallel: data.parallel || prev.parallel,
          language: data.language || prev.language,
          is_first_edition: data.is_first_edition || prev.is_first_edition,
          card_category: data.card_category || prev.card_category,
          stage: data.stage || prev.stage,
          finish: data.finish || prev.finish,
          weakness_type: data.weakness_type || prev.weakness_type,
          resistance_type: data.resistance_type || prev.resistance_type,
          retreat_cost: data.retreat_cost || prev.retreat_cost,
          evolves_from: data.evolves_from || prev.evolves_from,
          illustrator: data.illustrator || prev.illustrator,
          regulation_mark: data.regulation_mark || prev.regulation_mark,
          character_name: data.name || prev.character_name,
          edition: data.edition || prev.edition,
        }));
      }
    } catch (err) {
      console.error('Scan failed:', err);
    }
    setScanning(false);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      // Upload images first
      let front_image_url = null;
      let back_image_url = null;

      if (frontImage) {
        const fd = new FormData();
        fd.append('image', frontImage.file);
        const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: fd });
        if (res.ok) front_image_url = (await res.json()).url;
      }
      if (backImage) {
        const fd = new FormData();
        fd.append('image', backImage.file);
        const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: fd });
        if (res.ok) back_image_url = (await res.json()).url;
      }

      const cardData = {
        ...form,
        front_image_url,
        back_image_url,
        hp: form.hp ? parseInt(form.hp) : null,
        retreat_cost: form.retreat_cost ? parseInt(form.retreat_cost) : null,
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        character_name: form.character_name || form.name,
      };

      const res = await fetch(`${API_URL}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      });

      if (res.ok) {
        onSave?.();
        onClose();
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving(false);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const isPokemon = form.card_category === 'Pokemon';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Add New Card</h2>
          <button onClick={onClose} style={{ background: 'none', color: '#8b949e', fontSize: 20 }}>X</button>
        </div>

        {/* Image upload */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={styles.imageBox} onClick={() => frontInputRef.current.click()}>
            {frontImage ? (
              <img src={frontImage.url} alt="Front" style={styles.preview} />
            ) : (
              <span style={{ color: '#8b949e', fontSize: 13 }}>+ Front Image</span>
            )}
            <input ref={frontInputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => handleImageUpload(e, 'front')} />
          </div>
          <div style={styles.imageBox} onClick={() => backInputRef.current.click()}>
            {backImage ? (
              <img src={backImage.url} alt="Back" style={styles.preview} />
            ) : (
              <span style={{ color: '#8b949e', fontSize: 13 }}>+ Back Image</span>
            )}
            <input ref={backInputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => handleImageUpload(e, 'back')} />
          </div>
        </div>

        {frontImage && (
          <button className="btn btn-primary" onClick={handleScan} disabled={scanning} style={{ width: '100%', marginBottom: 20, justifyContent: 'center' }}>
            {scanning ? 'Scanning with AI...' : 'Scan Card with AI'}
          </button>
        )}

        {/* === SECTION: Card Identity === */}
        <div style={styles.section}>Card Identity</div>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Card Category</label>
            <select value={form.card_category} onChange={e => update('card_category', e.target.value)} style={styles.input}>
              {CARD_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>{isPokemon ? 'Pokemon Name' : 'Card Name'}</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} placeholder={isPokemon ? 'e.g. Charizard' : 'e.g. Boss\'s Orders'} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Card Number</label>
            <input value={form.card_number} onChange={e => update('card_number', e.target.value)} placeholder="e.g. 006/165" style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Set / Expansion</label>
            <input value={form.set_name} onChange={e => update('set_name', e.target.value)} placeholder="e.g. Obsidian Flames" style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Year</label>
            <input value={form.year} onChange={e => update('year', e.target.value)} placeholder="e.g. 2024" style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Rarity</label>
            <select value={form.rarity} onChange={e => update('rarity', e.target.value)} style={styles.input}>
              <option value="">Select Rarity</option>
              {RARITIES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Trainer/Energy subtypes */}
        {form.card_category === 'Trainer' && (
          <div style={{ marginTop: 12 }}>
            <label style={styles.label}>Trainer Subtype</label>
            <select value={form.trainer_subtype} onChange={e => update('trainer_subtype', e.target.value)} style={styles.input}>
              <option value="">Select Type</option>
              {TRAINER_SUBTYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        )}
        {form.card_category === 'Energy' && (
          <div style={{ marginTop: 12 }}>
            <label style={styles.label}>Energy Subtype</label>
            <select value={form.energy_subtype} onChange={e => update('energy_subtype', e.target.value)} style={styles.input}>
              <option value="">Select Type</option>
              {ENERGY_SUBTYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        )}

        {/* === SECTION: Pokemon Attributes === */}
        {isPokemon && (
          <>
            <div style={styles.section}>Pokemon Attributes</div>
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Energy Type</label>
                <select value={form.energy_type} onChange={e => update('energy_type', e.target.value)} style={styles.input}>
                  <option value="">Select Type</option>
                  {ENERGY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>HP</label>
                <input value={form.hp} onChange={e => update('hp', e.target.value)} placeholder="e.g. 330" type="number" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Stage</label>
                <select value={form.stage} onChange={e => update('stage', e.target.value)} style={styles.input}>
                  <option value="">Select Stage</option>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Evolves From</label>
                <input value={form.evolves_from} onChange={e => update('evolves_from', e.target.value)} placeholder="e.g. Charmeleon" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Weakness</label>
                <select value={form.weakness_type} onChange={e => update('weakness_type', e.target.value)} style={styles.input}>
                  <option value="">None</option>
                  {ENERGY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Resistance</label>
                <select value={form.resistance_type} onChange={e => update('resistance_type', e.target.value)} style={styles.input}>
                  <option value="">None</option>
                  {ENERGY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Retreat Cost</label>
                <input value={form.retreat_cost} onChange={e => update('retreat_cost', e.target.value)} placeholder="0-5" type="number" min="0" max="5" style={styles.input} />
              </div>
            </div>
          </>
        )}

        {/* === SECTION: Variant & Finish === */}
        <div style={styles.section}>Variant & Finish</div>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Finish</label>
            <select value={form.finish} onChange={e => update('finish', e.target.value)} style={styles.input}>
              <option value="">Select Finish</option>
              {FINISHES.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Parallel / Variant</label>
            <input value={form.parallel} onChange={e => update('parallel', e.target.value)} placeholder="e.g. Cosmos Holo" style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Edition</label>
            <select value={form.edition} onChange={e => update('edition', e.target.value)} style={styles.input}>
              {EDITIONS.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Language</label>
            <select value={form.language} onChange={e => update('language', e.target.value)} style={styles.input}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Illustrator</label>
            <input value={form.illustrator} onChange={e => update('illustrator', e.target.value)} placeholder="e.g. Mitsuhiro Arita" style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Regulation Mark</label>
            <input value={form.regulation_mark} onChange={e => update('regulation_mark', e.target.value)} placeholder="e.g. G, H, I" style={styles.input} />
          </div>
        </div>

        {/* Flags row */}
        <div style={{ marginTop: 12, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.is_first_edition} onChange={e => update('is_first_edition', e.target.checked)} />
            1st Edition
          </label>
          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.is_promo} onChange={e => update('is_promo', e.target.checked)} />
            Promo Card
          </label>
          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.is_error_card} onChange={e => update('is_error_card', e.target.checked)} />
            Error / Misprint
          </label>
        </div>
        {form.is_promo && (
          <div style={{ marginTop: 8 }}>
            <input value={form.promo_number} onChange={e => update('promo_number', e.target.value)} placeholder="Promo number (e.g. SWSH001)" style={styles.input} />
          </div>
        )}
        {form.is_error_card && (
          <div style={{ marginTop: 8 }}>
            <input value={form.error_description} onChange={e => update('error_description', e.target.value)} placeholder="Describe the error/misprint" style={{ ...styles.input, width: '100%' }} />
          </div>
        )}

        {/* === SECTION: Condition & Grading === */}
        <div style={styles.section}>Condition & Grading</div>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Condition</label>
            <select value={form.condition} onChange={e => update('condition', e.target.value)} style={styles.input}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.is_graded} onChange={e => update('is_graded', e.target.checked)} />
            Graded / Slabbed
          </label>
        </div>
        {form.is_graded && (
          <div style={{ ...styles.grid, marginTop: 12 }}>
            <div>
              <label style={styles.label}>Grading Company</label>
              <select value={form.grading_company} onChange={e => update('grading_company', e.target.value)} style={styles.input}>
                <option value="">Select</option>
                <option>PSA</option>
                <option>BGS</option>
                <option>CGC</option>
                <option>SGC</option>
                <option>ACE</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Grade</label>
              <input value={form.grade} onChange={e => update('grade', e.target.value)} placeholder="e.g. 10, 9.5" style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Cert Number</label>
              <input value={form.cert_number} onChange={e => update('cert_number', e.target.value)} placeholder="Certification #" style={styles.input} />
            </div>
          </div>
        )}

        {/* === SECTION: Inventory === */}
        <div style={styles.section}>Inventory</div>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Purchase Price ($)</label>
            <input value={form.purchase_price} onChange={e => update('purchase_price', e.target.value)} placeholder="0.00" type="number" step="0.01" style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Storage Location</label>
            <input value={form.storage_location} onChange={e => update('storage_location', e.target.value)} placeholder="e.g. Binder 3, Page 5" style={styles.input} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={styles.label}>Notes</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any additional notes..." rows={2} style={{ ...styles.input, width: '100%' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name}>
            {saving ? 'Saving...' : 'Save Card'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  modal: {
    background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
    padding: 24, width: 600, maxHeight: '90vh', overflowY: 'auto',
  },
  imageBox: {
    flex: 1, height: 180, background: '#0d1117', border: '2px dashed #30363d',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%', objectFit: 'contain' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: { width: '100%', padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14 },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 },
  section: { fontSize: 13, fontWeight: 600, color: '#58a6ff', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 10, borderBottom: '1px solid #1a2332', paddingBottom: 6 },
  checkbox: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8b949e', cursor: 'pointer' },
};
