import React, { useState, useRef } from 'react';

const CARD_TYPES = ['Common', 'Uncommon', 'Rare', 'Holo Rare', 'Reverse Holo', 'Ultra Rare', 'Full Art', 'Alt Art', 'Secret Rare', 'Gold', 'Trainer Gallery', 'Illustration Rare', 'Special Illustration Rare', 'Hyper Rare'];
const CONDITIONS = ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];

export default function AddCardModal({ onClose }) {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState({
    name: '',
    card_number: '',
    set_name: '',
    year: '',
    rarity: '',
    card_type: '',
    condition: 'Near Mint',
    parallel: '',
    language: 'English',
    energy_type: '',
    hp: '',
    is_first_edition: false,
    is_graded: false,
    grade: '',
    grading_company: '',
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
    // TODO: Send image to server → Gemini AI → auto-fill form
    setTimeout(() => {
      setScanning(false);
    }, 1500);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

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

        {/* Form fields */}
        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>Pokemon Name</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Charizard" style={{ width: '100%' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Card Number</label>
            <input value={form.card_number} onChange={e => update('card_number', e.target.value)} placeholder="e.g. 006/165" style={{ width: '100%' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Set / Expansion</label>
            <input value={form.set_name} onChange={e => update('set_name', e.target.value)} placeholder="e.g. Scarlet & Violet 151" style={{ width: '100%' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Year</label>
            <input value={form.year} onChange={e => update('year', e.target.value)} placeholder="e.g. 2024" style={{ width: '100%' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Rarity</label>
            <select value={form.rarity} onChange={e => update('rarity', e.target.value)} style={{ width: '100%' }}>
              <option value="">Select Rarity</option>
              {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Condition</label>
            <select value={form.condition} onChange={e => update('condition', e.target.value)} style={{ width: '100%' }}>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Energy Type</label>
            <input value={form.energy_type} onChange={e => update('energy_type', e.target.value)} placeholder="e.g. Fire, Water, Psychic" style={{ width: '100%' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>HP</label>
            <input value={form.hp} onChange={e => update('hp', e.target.value)} placeholder="e.g. 330" style={{ width: '100%' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Parallel / Variant</label>
            <input value={form.parallel} onChange={e => update('parallel', e.target.value)} placeholder="e.g. Cosmos Holo" style={{ width: '100%' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Language</label>
            <select value={form.language} onChange={e => update('language', e.target.value)} style={{ width: '100%' }}>
              <option>English</option>
              <option>Japanese</option>
              <option>Korean</option>
              <option>Chinese</option>
              <option>French</option>
              <option>German</option>
              <option>Spanish</option>
              <option>Italian</option>
              <option>Portuguese</option>
            </select>
          </div>
        </div>

        {/* Graded section */}
        <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8b949e' }}>
            <input type="checkbox" checked={form.is_graded} onChange={e => update('is_graded', e.target.checked)} />
            Graded / Slabbed
          </label>
          {form.is_graded && (
            <>
              <select value={form.grading_company} onChange={e => update('grading_company', e.target.value)} style={{ width: 120 }}>
                <option value="">Company</option>
                <option>PSA</option>
                <option>BGS</option>
                <option>CGC</option>
                <option>SGC</option>
              </select>
              <input value={form.grade} onChange={e => update('grade', e.target.value)} placeholder="Grade (e.g. 10)" style={{ width: 80 }} />
            </>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={styles.label}>Notes</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any additional notes..." rows={2} style={{ width: '100%' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save Card</button>
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
    padding: 24, width: 560, maxHeight: '90vh', overflowY: 'auto',
  },
  imageBox: {
    flex: 1, height: 160, background: '#0d1117', border: '2px dashed #30363d',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%', objectFit: 'contain' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: {},
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 },
};
