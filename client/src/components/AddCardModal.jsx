import React, { useState, useRef, useMemo } from 'react';
import { API_URL } from '../config';

const RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Holo Rare', 'Reverse Holo',
  'Double Rare', 'Ultra Rare', 'Full Art', 'Alt Art', 'Secret Rare',
  'Illustration Rare', 'Special Illustration Rare', 'Hyper Rare',
  'Gold', 'Trainer Gallery', 'Amazing Rare', 'Radiant Rare',
  'Shiny Rare', 'Shiny Ultra Rare', 'ACE SPEC Rare',
];
const CONDITIONS = ['Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];

const buildCompLinks = (form) => {
  const num = form.card_number ? form.card_number.split('/')[0] : '';
  const grading = form.is_graded && form.grading_company && form.grade ? `${form.grading_company} ${form.grade}` : '';
  const baseQuery = [form.year, 'Pokemon', form.set_name, form.name, num, grading].filter(Boolean).join(' ');
  const q = encodeURIComponent(baseQuery);
  return {
    ebaySold: `https://www.ebay.com/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1&_sop=13`,
    ebayActive: `https://www.ebay.com/sch/i.html?_nkw=${q}&_sop=15`,
    priceCharting: `https://www.pricecharting.com/search-products?q=${q}&type=prices`,
  };
};
const ENERGY_TYPES = ['Fire', 'Water', 'Grass', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Fairy', 'Colorless'];
const STAGES = ['Basic', 'Stage 1', 'Stage 2', 'BREAK', 'Level X', 'Mega EX', 'GX', 'V', 'VMAX', 'VSTAR', 'ex', 'Radiant'];
const FINISHES = ['Holo', 'Reverse Holo', 'Non-Holo', 'Full Art', 'Cosmos Holo'];
const EDITIONS = ['Unlimited', '1st Edition', 'Shadowless'];
const CARD_CATEGORIES = ['Pokemon', 'Trainer', 'Energy'];
const TRAINER_SUBTYPES = ['Item', 'Supporter', 'Stadium', 'Tool'];
const ENERGY_SUBTYPES = ['Basic', 'Special'];
const LANGUAGES = ['English', 'Japanese', 'Korean', 'Chinese Traditional', 'Chinese Simplified', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Polish', 'Dutch', 'Thai', 'Indonesian'];
const LISTING_DURATIONS = [
  { value: 'GTC', label: 'Good Til Cancelled (Buy It Now only)' },
  { value: 'DAYS_1', label: '1 day' },
  { value: 'DAYS_3', label: '3 days' },
  { value: 'DAYS_5', label: '5 days' },
  { value: 'DAYS_7', label: '7 days' },
  { value: 'DAYS_10', label: '10 days' },
];

export default function AddCardModal({ onClose, onSave, user }) {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookingUpPrice, setLookingUpPrice] = useState(false);
  const [priceMatches, setPriceMatches] = useState([]);
  const [priceError, setPriceError] = useState('');

  const defaultBid = user?.ebay_default_starting_bid ?? 0.01;

  const [form, setForm] = useState({
    name: '',
    card_number: '',
    set_name: '',
    year: '',
    card_category: 'Pokemon',
    trainer_subtype: '',
    energy_subtype: '',
    rarity: '',
    stage: '',
    finish: '',
    edition: 'Unlimited',
    energy_type: '',
    hp: '',
    weakness_type: '',
    resistance_type: '',
    retreat_cost: '',
    evolves_from: '',
    parallel: '',
    language: 'English',
    illustrator: '',
    regulation_mark: '',
    character_name: '',
    condition: '',
    is_graded: false,
    grading_company: '',
    grade: '',
    cert_number: '',
    is_first_edition: false,
    is_promo: false,
    promo_number: '',
    is_error_card: false,
    error_description: '',
    notes: '',
    // Listing
    listing_format: 'FIXED_PRICE',
    listing_duration: 'GTC',
    ebay_price: '',
    auction_start_price: String(defaultBid),
    auction_reserve_price: '',
    listing_title: '',
    listing_description: '',
  });

  const frontInputRef = useRef();
  const backInputRef = useRef();

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const isPokemon = form.card_category === 'Pokemon';
  const isAuction = form.listing_format === 'AUCTION';

  // Auto-generated title/description suggestions
  const suggestedTitle = useMemo(() => {
    const parts = [
      form.year,
      'Pokemon',
      form.set_name,
      form.name,
      form.card_number,
      form.rarity,
      form.finish && form.finish !== 'Non-Holo' ? form.finish : '',
      form.is_graded && form.grading_company && form.grade ? `${form.grading_company} ${form.grade}` : '',
    ].filter(Boolean);
    return parts.join(' ').slice(0, 80);
  }, [form.year, form.set_name, form.name, form.card_number, form.rarity, form.finish, form.is_graded, form.grading_company, form.grade]);

  const suggestedDescription = useMemo(() => {
    const lines = [
      `Pokemon TCG single card from ${form.set_name || 'set'} (${form.year || 'year unknown'}).`,
      '',
      `Card: ${form.name}`,
      form.card_number ? `Number: ${form.card_number}` : '',
      form.rarity ? `Rarity: ${form.rarity}` : '',
      form.finish ? `Finish: ${form.finish}` : '',
      form.language ? `Language: ${form.language}` : '',
      form.condition ? `Condition: ${form.condition}` : '',
      form.is_graded && form.grading_company ? `Graded: ${form.grading_company} ${form.grade}${form.cert_number ? ` (Cert ${form.cert_number})` : ''}` : '',
      '',
      'Ships in a penny sleeve and toploader. Combined shipping available — message before paying for multiple cards.',
    ].filter(Boolean);
    return lines.join('\n');
  }, [form]);

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
        const next = {
          name: data.name || form.name,
          card_number: data.card_number || form.card_number,
          set_name: data.set_name || form.set_name,
          year: data.year || form.year,
          rarity: data.rarity || form.rarity,
          energy_type: data.energy_type || form.energy_type,
          hp: data.hp || form.hp,
          parallel: data.parallel || form.parallel,
          language: data.language || form.language,
          is_first_edition: data.is_first_edition || form.is_first_edition,
          card_category: data.card_category || form.card_category,
          stage: data.stage || form.stage,
          finish: data.finish || form.finish,
          weakness_type: data.weakness_type || form.weakness_type,
          resistance_type: data.resistance_type || form.resistance_type,
          retreat_cost: data.retreat_cost || form.retreat_cost,
          evolves_from: data.evolves_from || form.evolves_from,
          illustrator: data.illustrator || form.illustrator,
          regulation_mark: data.regulation_mark || form.regulation_mark,
          character_name: data.name || form.character_name,
          edition: data.edition || form.edition,
        };
        setForm(prev => ({ ...prev, ...next }));
      }
    } catch (err) {
      console.error('Scan failed:', err);
    }
    setScanning(false);
  };

  const lookupPrice = async (name, set_name, card_number) => {
    const n = name ?? form.name;
    if (!n) return;
    setLookingUpPrice(true);
    setPriceError('');
    setPriceMatches([]);
    try {
      const params = new URLSearchParams({ name: n });
      if (set_name ?? form.set_name) params.set('set_name', set_name ?? form.set_name);
      if (card_number ?? form.card_number) params.set('card_number', card_number ?? form.card_number);
      const res = await fetch(`${API_URL}/api/price-lookup?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setPriceError(data.error || 'Lookup failed');
        return;
      }
      setPriceMatches(data.matches || []);
      if (!data.matches?.length) setPriceError('No matches found');
    } catch {
      setPriceError('Connection failed');
    } finally {
      setLookingUpPrice(false);
    }
  };

  const applySuggestedPrice = (price) => {
    if (isAuction) update('auction_start_price', String(price));
    else update('ebay_price', String(price));
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
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
        character_name: form.character_name || form.name,
        user_id: user?.id || null,
        // Listing fields
        listing_title: form.listing_title || suggestedTitle,
        listing_description: form.listing_description || suggestedDescription,
        ebay_price: form.ebay_price ? parseFloat(form.ebay_price) : null,
        auction_start_price: form.auction_start_price ? parseFloat(form.auction_start_price) : null,
        auction_reserve_price: form.auction_reserve_price ? parseFloat(form.auction_reserve_price) : null,
        ebay_status: 'unlisted',
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
            {frontImage ? <img src={frontImage.url} alt="Front" style={styles.preview} /> : <span style={{ color: '#8b949e', fontSize: 13 }}>+ Front Image</span>}
            <input ref={frontInputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => handleImageUpload(e, 'front')} />
          </div>
          <div style={styles.imageBox} onClick={() => backInputRef.current.click()}>
            {backImage ? <img src={backImage.url} alt="Back" style={styles.preview} /> : <span style={{ color: '#8b949e', fontSize: 13 }}>+ Back Image</span>}
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
            <label style={styles.label}>Condition <span style={{ color: '#f85149' }}>*</span></label>
            <select value={form.condition} onChange={e => update('condition', e.target.value)} style={styles.input}>
              <option value="">Select condition...</option>
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

        {/* === SECTION: eBay Listing === */}
        <div style={styles.section}>eBay Listing</div>

        {/* Pricing research */}
        <div style={styles.priceBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Research Comparable Sales</span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => lookupPrice()}
              disabled={lookingUpPrice || !form.name || !form.condition}
              style={{ fontSize: 12, padding: '4px 10px' }}
              title={!form.condition ? 'Select a condition first' : ''}
            >
              {lookingUpPrice ? 'Loading...' : 'Get References'}
            </button>
          </div>

          {!form.condition && (
            <div style={{ fontSize: 12, color: '#8b949e' }}>
              Select a condition above first. Condition drives price more than anything else and AI can't reliably grade from a photo.
            </div>
          )}

          {form.condition && form.name && (() => {
            const links = buildCompLinks(form);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: '#8b949e' }}>
                  Open the real comp data — actual recent sales filtered to this exact card, in any condition you can read on the listing:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <a href={links.ebaySold} target="_blank" rel="noopener noreferrer" style={styles.compLinkPrimary}>
                    🔥 eBay Sold Listings (real prices)
                  </a>
                  <a href={links.ebayActive} target="_blank" rel="noopener noreferrer" style={styles.compLink}>
                    eBay Active (current asks)
                  </a>
                  <a href={links.priceCharting} target="_blank" rel="noopener noreferrer" style={styles.compLink}>
                    PriceCharting
                  </a>
                </div>
              </div>
            );
          })()}

          {priceError && <div style={{ fontSize: 12, color: '#8b949e', marginTop: 8 }}>{priceError}</div>}

          {priceMatches.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #21262d', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#8b949e' }}>
                <strong style={{ color: '#e6edf3' }}>Reference prices (Near Mint baseline):</strong>
                {' '}from TCGplayer + Cardmarket. Click a chip to apply it as your starting price, then adjust based on the eBay sold comps.
              </div>
              {priceMatches.map(m => (
                <div key={m.id} style={styles.priceRow}>
                  {m.image && <img src={m.image} alt="" style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 4 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {m.name} <span style={{ color: '#8b949e' }}>· {m.set} · {m.number}</span>
                      {m.tcgplayer_url && (
                        <a href={m.tcgplayer_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: 11, color: '#58a6ff' }}>
                          View on TCGplayer →
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {m.variants.map(v => v.market != null && (
                        <button
                          key={v.variant}
                          type="button"
                          onClick={() => applySuggestedPrice(v.market.toFixed(2))}
                          style={styles.priceChip}
                          title={`TCGplayer ${v.variant} NM market — Low $${v.low ?? '—'} / High $${v.high ?? '—'}`}
                        >
                          TCG {v.variant}: <strong>${v.market.toFixed(2)}</strong>
                        </button>
                      ))}
                      {m.cardmarket_avg != null && (
                        <button
                          type="button"
                          onClick={() => applySuggestedPrice(m.cardmarket_avg.toFixed(2))}
                          style={styles.priceChip}
                          title="Cardmarket (Europe) average sell price"
                        >
                          Cardmarket avg: <strong>${m.cardmarket_avg.toFixed(2)}</strong>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...styles.grid, marginTop: 12 }}>
          <div>
            <label style={styles.label}>Format</label>
            <select value={form.listing_format} onChange={e => update('listing_format', e.target.value)} style={styles.input}>
              <option value="FIXED_PRICE">Buy It Now</option>
              <option value="AUCTION">Auction</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Duration</label>
            <select value={form.listing_duration} onChange={e => update('listing_duration', e.target.value)} style={styles.input}>
              {LISTING_DURATIONS.map(d => <option key={d.value} value={d.value} disabled={isAuction && d.value === 'GTC'}>{d.label}</option>)}
            </select>
          </div>
          {!isAuction && (
            <div>
              <label style={styles.label}>Buy It Now Price ($)</label>
              <input value={form.ebay_price} onChange={e => update('ebay_price', e.target.value)} placeholder="0.00" type="number" step="0.01" style={styles.input} />
            </div>
          )}
          {isAuction && (
            <>
              <div>
                <label style={styles.label}>Starting Bid ($)</label>
                <input value={form.auction_start_price} onChange={e => update('auction_start_price', e.target.value)} placeholder="0.01" type="number" step="0.01" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Reserve Price ($) — optional</label>
                <input value={form.auction_reserve_price} onChange={e => update('auction_reserve_price', e.target.value)} placeholder="0.00" type="number" step="0.01" style={styles.input} />
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={styles.label}>Listing Title <span style={{ color: '#484f58' }}>(80 char max — leave blank to auto-generate)</span></label>
          <input
            value={form.listing_title}
            onChange={e => update('listing_title', e.target.value.slice(0, 80))}
            placeholder={suggestedTitle || 'Will auto-generate from card details'}
            style={{ ...styles.input, width: '100%' }}
          />
          <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>
            {(form.listing_title || suggestedTitle).length}/80
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={styles.label}>Listing Description <span style={{ color: '#484f58' }}>(leave blank to auto-generate)</span></label>
          <textarea
            value={form.listing_description}
            onChange={e => update('listing_description', e.target.value)}
            placeholder={suggestedDescription}
            rows={5}
            style={{ ...styles.input, width: '100%', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={styles.label}>Internal Notes (not shown on listing)</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any additional notes..." rows={2} style={{ ...styles.input, width: '100%', fontFamily: 'inherit' }} />
        </div>

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
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, width: 600, maxHeight: '90vh', overflowY: 'auto' },
  imageBox: { flex: 1, height: 180, background: '#0d1117', border: '2px dashed #30363d', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' },
  preview: { width: '100%', height: '100%', objectFit: 'contain' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: { width: '100%', padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14 },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 },
  section: { fontSize: 13, fontWeight: 600, color: '#58a6ff', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 10, borderBottom: '1px solid #1a2332', paddingBottom: 6 },
  checkbox: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8b949e', cursor: 'pointer' },
  priceBox: { background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 12 },
  priceRow: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  priceChip: { background: '#1a2332', border: '1px solid #30363d', color: '#3fb950', fontSize: 12, padding: '4px 8px', borderRadius: 4, cursor: 'pointer' },
  compLink: { display: 'inline-block', padding: '8px 12px', background: '#1a2332', border: '1px solid #30363d', borderRadius: 6, color: '#58a6ff', fontSize: 13, textDecoration: 'none' },
  compLinkPrimary: { display: 'inline-block', padding: '8px 12px', background: '#1f6feb', border: '1px solid #1f6feb', borderRadius: 6, color: '#fff', fontSize: 13, textDecoration: 'none', fontWeight: 500 },
};
