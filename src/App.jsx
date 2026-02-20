import { useState, useRef, useCallback } from 'react'

const BAGUA = {
  North:     { element: 'Water', area: 'Career & Life Path' },
  South:     { element: 'Fire',  area: 'Fame & Reputation' },
  East:      { element: 'Wood',  area: 'Family & Health' },
  West:      { element: 'Metal', area: 'Creativity' },
  Northeast: { element: 'Earth', area: 'Knowledge' },
  Northwest: { element: 'Metal', area: 'Helpful People' },
  Southeast: { element: 'Wood',  area: 'Wealth & Prosperity' },
  Southwest: { element: 'Earth', area: 'Love & Relationships' },
}
const EL_COLORS = { Wood: '#22c55e', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#94a3b8', Water: '#60a5fa' }
const ROOM_TYPES = ['Living Room', 'Bedroom', 'Office', 'Kitchen', 'Dining Room', 'Bathroom', 'Entryway']
const GOALS = ['Attract Wealth', 'Improve Relationships', 'Boost Career', 'Enhance Health', 'Increase Creativity', 'Find Peace & Calm', 'Improve Sleep']

const DEMO = {
  doorDir: 'Southeast', roomType: 'Living Room', goal: 'Attract Wealth',
  images: [
    { url: '/demo/living-room.jpg', label: 'Living Room' },
    { url: '/demo/bedroom.jpg', label: 'Bedroom' },
    { url: '/demo/office.jpg', label: 'Office' },
  ],
  analysis: {
    overallScore: 72, energyFlow: 'Moderate', commanding_position: 'Partial',
    summary: 'Across all three rooms, chi flow is moderate — the living room has strong natural light and open circulation, but the bedroom lacks commanding position and the office has stagnant energy in the wealth corner. The Southeast entrance activates Wood energy, which favors growth when properly supported across the whole space.',
    issues: [
      { severity: 'moderate', title: 'Sofa faces away from door', description: 'The main seating does not have a clear sightline to the entrance, reducing your sense of security and command in the space.', fix: 'Angle or reposition the sofa so the primary seat faces the door while still maintaining conversation flow.' },
      { severity: 'minor', title: 'Clutter in Wealth corner', description: 'The Southeast corner (your Wealth & Prosperity bagua area) appears cluttered, blocking chi from accumulating there.', fix: 'Clear the Southeast corner and place a jade plant or purple amethyst crystal to activate wealth chi.' },
      { severity: 'minor', title: 'Missing Water element', description: 'With a Southeast door, Water is underrepresented, which can slow wealth accumulation.', fix: 'Add a small tabletop fountain or a painting with water imagery on the North wall.' },
    ],
    priorityActions: [
      'Reposition the sofa to face the main entrance — this is the single highest-impact change.',
      'Clear and activate the Southeast corner with a live plant or amethyst cluster.',
      'Add a mirror on the East wall to double the light and expand the sense of space.',
    ],
    elementBalance: { Wood: 35, Fire: 15, Earth: 20, Metal: 10, Water: 20 },
  },
}

// Pencil-sketch SVG decorations
const SketchCompass = ({ dark }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke={dark ? 'rgba(240,220,180,0.35)' : 'rgba(100,80,40,0.2)'} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="19.5" strokeWidth="1"/>
    <circle cx="24" cy="24" r="3.5" strokeWidth="1.2"/>
    <line x1="24" y1="5" x2="24" y2="13" strokeWidth="1.5"/>
    <line x1="24" y1="35" x2="24" y2="43" strokeWidth="1"/>
    <line x1="5" y1="24" x2="13" y2="24" strokeWidth="1"/>
    <line x1="35" y1="24" x2="43" y2="24" strokeWidth="1"/>
    <path d="M24 6 L22 11 L24 9.5 L26 11 Z" fill={dark ? 'rgba(240,220,180,0.3)' : 'rgba(100,80,40,0.15)'}/>
    <text x="24" y="19" textAnchor="middle" fontSize="5" fontFamily="Georgia" fill={dark ? 'rgba(240,220,180,0.4)' : 'rgba(80,60,20,0.3)'} stroke="none">N</text>
    <text x="24" y="33.5" textAnchor="middle" fontSize="4.5" fontFamily="Georgia" fill={dark ? 'rgba(240,220,180,0.3)' : 'rgba(80,60,20,0.2)'} stroke="none">S</text>
  </svg>
)

const SketchLeaf = ({ dark }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={dark ? 'rgba(100,220,130,0.3)' : 'rgba(30,100,50,0.2)'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2">
    <path d="M14 24 C14 24 6 18 6.5 10 C6.5 5 11 3 14 3 C17 3 21.5 5 21.5 10 C22 18 14 24 14 24Z"/>
    <path d="M14 24 C14 18 14 12 14 4" strokeWidth="0.8" opacity="0.6"/>
    <path d="M14 16 C11 14 9 12 8 10" strokeWidth="0.7" opacity="0.5"/>
    <path d="M14 13 C17 11 19 9 20 8" strokeWidth="0.7" opacity="0.5"/>
  </svg>
)

const SketchBagua = ({ dark }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={dark ? 'rgba(200,170,240,0.3)' : 'rgba(80,60,120,0.15)'} strokeLinecap="round" strokeWidth="1.5">
    <circle cx="16" cy="16" r="14" strokeDasharray="3,2"/>
    <circle cx="16" cy="16" r="5"/>
    {[0,45,90,135,180,225,270,315].map((a, i) => {
      const r = Math.PI * a / 180
      const x1 = 16 + Math.cos(r) * 6, y1 = 16 + Math.sin(r) * 6
      const x2 = 16 + Math.cos(r) * 13, y2 = 16 + Math.sin(r) * 13
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" opacity="0.7"/>
    })}
  </svg>
)

const SketchChiFlow = ({ dark, score }) => {
  const color = dark ? 'rgba(200,200,255,0.2)' : 'rgba(80,80,180,0.12)'
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
      <circle cx="60" cy="60" r="55" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4,4"/>
      <circle cx="60" cy="60" r="45" fill="none" stroke={color} strokeWidth="0.7" strokeDasharray="2,6"/>
      <path d="M60 10 Q90 40 60 60 Q30 80 60 110" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// Paper texture SVG as data URL
const paperFilter = `
<svg xmlns='http://www.w3.org/2000/svg'>
  <filter id='p'>
    <feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
    <feBlend in='SourceGraphic' mode='multiply'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#p)' opacity='0.04'/>
</svg>`
const paperDataUrl = `url("data:image/svg+xml,${encodeURIComponent(paperFilter)}")`

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('fs_dark')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [images, setImages] = useState([])
  const [doorDir, setDoorDir] = useState('')
  const [roomType, setRoomType] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isDemo, setIsDemo] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('fs_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const fileRef = useRef(null)

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('fs_dark', String(next))
  }

  // Colors
  const c = {
    bg: dark ? '#12101a' : '#f8f3ec',
    glass: dark
      ? { background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px) saturate(150%)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)' }
      : { background: 'rgba(255,250,240,0.5)', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)', border: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 8px 32px rgba(120,100,60,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' },
    text: dark ? 'rgba(240,235,220,0.9)' : 'rgba(42,32,15,0.85)',
    textSub: dark ? 'rgba(240,235,220,0.35)' : 'rgba(42,32,15,0.35)',
    textMid: dark ? 'rgba(240,235,220,0.6)' : 'rgba(42,32,15,0.6)',
    input: dark
      ? { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,220,0.85)' }
      : { background: 'rgba(255,250,235,0.7)', border: '1px solid rgba(200,180,120,0.3)', color: 'rgba(42,32,15,0.85)' },
    accent: '#0071e3',
    headerBg: dark ? 'rgba(18,16,26,0.8)' : 'rgba(248,243,236,0.8)',
    label: dark ? 'rgba(240,235,220,0.3)' : 'rgba(42,32,15,0.3)',
    demoBg: dark ? 'rgba(0,113,227,0.08)' : 'rgba(160,120,60,0.07)',
    demoBorder: dark ? 'rgba(0,113,227,0.2)' : 'rgba(160,120,60,0.2)',
    errorBg: dark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
    errorBorder: dark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.25)',
    issueBg: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    barBg: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    btnSecBg: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    btnSecBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
    btnSecText: dark ? 'rgba(240,235,220,0.45)' : 'rgba(42,32,15,0.45)',
    divider: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    keyBtnColor: apiKey ? '#22c55e' : (dark ? 'rgba(240,235,220,0.4)' : 'rgba(42,32,15,0.4)'),
    keyBtnBg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    keyBtnBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  }

  const glass = { ...c.glass, borderRadius: 18 }

  const selectStyle = {
    width: '100%', padding: '13px 16px', fontSize: 16,
    fontFamily: "-apple-system, 'Helvetica Neue', Georgia, sans-serif",
    borderRadius: 12, outline: 'none', appearance: 'none', WebkitAppearance: 'none',
    touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
    ...c.input,
  }

  const toBase64 = useRef((f) => new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1])
    r.onerror = rej
    r.readAsDataURL(f)
  }))

  const addImages = useCallback(async (files) => {
    const arr = Array.from(files)
    if (!arr.length) return
    if (fileRef.current) fileRef.current.value = ''
    const processed = await Promise.all(arr.map(async (f) => ({
      url: URL.createObjectURL(f), base64: await toBase64.current(f), mediaType: f.type || 'image/jpeg',
    })))
    setImages((prev) => [...prev, ...processed].slice(0, 5))
    setIsDemo(false)
  }, [])

  const removeImage = (idx) => { setImages((prev) => prev.filter((_, i) => i !== idx)); setIsDemo(false) }

  const loadDemo = () => {
    setImages(DEMO.images.map((img) => ({ url: img.url, base64: null, mediaType: 'image/jpeg', demoLabel: img.label })))
    setDoorDir(DEMO.doorDir); setRoomType(DEMO.roomType); setGoal(DEMO.goal)
    setAnalysis(DEMO.analysis); setError(null); setIsDemo(true)
  }

  const reset = () => {
    setAnalysis(null); setImages([]); setDoorDir(''); setRoomType(''); setGoal(''); setError(null); setIsDemo(false)
  }

  const saveKey = (k) => { const t = k.trim(); setApiKey(t); localStorage.setItem('fs_api_key', t); setShowKeyInput(false) }

  const analyze = async () => {
    if (!images.length || !doorDir || !roomType || !goal) return
    if (!apiKey) { setShowKeyInput(true); return }
    setLoading(true); setError(null); setAnalysis(null); setIsDemo(false)
    try {
      const resolvedImages = await Promise.all(images.map(async (img) => {
        if (img.base64) return img
        const resp = await fetch(img.url)
        const blob = await resp.blob()
        const base64 = await new Promise((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(r.result.split(',')[1])
          r.onerror = reject
          r.readAsDataURL(blob)
        })
        return { ...img, base64, mediaType: blob.type || 'image/jpeg' }
      }))
      let res
      try {
        res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 'x-api-key': apiKey,
            'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514', max_tokens: 1000,
            system: `You are a feng shui master. Analyze room photos and respond ONLY in valid JSON:
{"overallScore":number,"energyFlow":"Good|Moderate|Blocked","commanding_position":"Yes|No|Partial",
"summary":"2-3 sentences","issues":[{"severity":"critical|moderate|minor","title":"string",
"description":"string","fix":"string"}],"priorityActions":["string","string","string"],
"elementBalance":{"Wood":number,"Fire":number,"Earth":number,"Metal":number,"Water":number}}`,
            messages: [{ role: 'user', content: [
              ...resolvedImages.map((img) => ({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.base64 } })),
              { type: 'text', text: `Analyze this ${roomType}. Door faces ${doorDir}. Goal: ${goal}. JSON only.` }
            ]}]
          })
        })
      } catch { throw new Error('Network error — check your internet connection.') }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        if (res.status === 401) throw new Error('Invalid API key.')
        if (res.status === 429) throw new Error('Rate limited — wait a moment and retry.')
        if (res.status === 413) throw new Error('Images too large — try fewer or smaller photos.')
        if (res.status >= 500) throw new Error('Anthropic API is down — try again shortly.')
        throw new Error(errData?.error?.message || `API error ${res.status}`)
      }
      const data = await res.json()
      if (!data.content?.length) throw new Error('Empty response from API.')
      const text = data.content.map((c) => c.text || '').join('').trim()
      const clean = text.replace(/```json|```/g, '').trim()
      if (!clean) throw new Error('No analysis returned — try again.')
      let parsed
      try { parsed = JSON.parse(clean) } catch { throw new Error('Could not parse response — try again.') }
      if (typeof parsed.overallScore !== 'number') throw new Error('Malformed response — try again.')
      setAnalysis(parsed)
    } catch (err) { setError(err.message || 'Analysis failed — try again.')
    } finally { setLoading(false) }
  }

  const bagua = BAGUA[doorDir]
  const canAnalyze = images.length > 0 && doorDir && roomType && goal && !loading
  const severityColor = { critical: '#ef4444', moderate: '#f59e0b', minor: '#22c55e' }

  return (
    <div style={{ minHeight: '100dvh', background: c.bg, backgroundImage: paperDataUrl, fontFamily: "-apple-system, 'Helvetica Neue', Georgia, sans-serif", overscrollBehavior: 'none', color: c.text }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box}
        body{margin:0;padding:0}
        select option{background:${dark ? '#18181b' : '#faf6ee'};color:${dark ? '#f0ebe0' : '#2a2010'}}
        @media (min-width: 768px) {
          .fs-container { max-width: 600px; padding: 28px 24px; }
        }
        @media (min-width: 1024px) {
          .fs-container { max-width: 720px; padding: 36px 32px; }
          .fs-results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .fs-score-card { grid-column: 1 / -1; }
          .fs-summary { grid-column: 1 / -1; }
          .fs-reset { grid-column: 1 / -1; }
        }
        @media (min-width: 1280px) {
          .fs-container { max-width: 900px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '14px 20px', paddingTop: 'max(14px, env(safe-area-inset-top))', background: c.headerBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${c.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SketchBagua dark={dark} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: c.text, letterSpacing: -0.3, fontFamily: "Georgia, 'Times New Roman', serif" }}>Chi Scan</div>
            <div style={{ fontSize: 11, color: c.textSub, marginTop: 1, letterSpacing: 0.2 }}>Feng Shui Analyzer</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowKeyInput(true)} style={{ background: c.keyBtnBg, border: `1px solid ${c.keyBtnBorder}`, borderRadius: 10, padding: '6px 11px', fontSize: 12, color: c.keyBtnColor, cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', fontFamily: "inherit" }}>
            {apiKey ? 'Key set' : 'API key'}
          </button>
          <button onClick={toggleDark} aria-label="Toggle dark mode" style={{ width: 36, height: 36, borderRadius: 10, background: c.keyBtnBg, border: `1px solid ${c.keyBtnBorder}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.textSub} strokeWidth="2" strokeLinecap="round">
              {dark
                ? <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
                : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyInput && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowKeyInput(false)}>
          <div style={{ ...glass, padding: 24, width: '100%', maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 8, fontFamily: "Georgia, serif" }}>Anthropic API Key</div>
            <div style={{ fontSize: 13, color: c.textMid, marginBottom: 16, lineHeight: 1.5 }}>Stored locally in your browser. Never sent anywhere except Anthropic.</div>
            <input autoFocus id="apikey-input" type="password" defaultValue={apiKey} placeholder="sk-ant-..."
              onKeyDown={(e) => e.key === 'Enter' && saveKey(e.target.value)}
              style={{ ...selectStyle, marginBottom: 12, borderRadius: 12, padding: '13px 16px' }}/>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowKeyInput(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `1px solid ${c.btnSecBorder}`, background: c.btnSecBg, fontSize: 15, color: c.btnSecText, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => saveKey(document.getElementById('apikey-input').value)} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: c.accent, fontSize: 15, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="fs-container" style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 480, margin: '0 auto', paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>

        {/* Demo banner */}
        {!analysis && images.length === 0 && (
          <div style={{ ...glass, padding: '16px 20px', marginBottom: 16, animation: 'fadeSlide 0.45s ease' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}><SketchLeaf dark={dark} /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4, fontFamily: "Georgia, serif" }}>New here?</div>
                <div style={{ fontSize: 13, color: c.textMid, marginBottom: 12, lineHeight: 1.5 }}>See a full analysis example — no photo or API key needed.</div>
                <button onClick={loadDemo} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${c.demoBorder}`, background: c.demoBg, color: '#0071e3', fontSize: 13, fontWeight: 600, cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', fontFamily: 'inherit' }}>
                  View Demo Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demo badge */}
        {isDemo && (
          <div style={{ ...glass, padding: '10px 16px', marginBottom: 12, border: `1px solid ${c.demoBorder}`, background: c.demoBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fadeSlide 0.3s ease' }}>
            <span style={{ fontSize: 13, color: '#0071e3', fontWeight: 500 }}>Demo — pre-loaded example analysis</span>
            <button onClick={reset} style={{ background: 'none', border: 'none', color: c.textSub, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Clear</button>
          </div>
        )}

        {/* Upload */}
        <div style={{ ...glass, padding: 20, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.label, textTransform: 'uppercase', letterSpacing: 1 }}>Room Photos</div>
          </div>
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden', border: `2px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  {img.demoLabel && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 9, padding: '2px 4px', textAlign: 'center' }}>{img.demoLabel}</div>}
                  <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, lineHeight: 1 }}>x</button>
                </div>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*,image/heic" capture="environment" multiple onChange={(e) => addImages(e.target.files)} style={{ display: 'none' }}/>
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '15px 0', borderRadius: 12, border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(140,100,60,0.3)'}`, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(180,140,80,0.06)', color: c.textMid, fontSize: 14, fontWeight: 500, cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', fontFamily: 'inherit', letterSpacing: 0.2 }}>
            {images.length === 0 ? 'Take photo or upload' : `Add more (${images.length}/5)`}
          </button>
        </div>

        {/* Room details */}
        <div style={{ ...glass, padding: 20, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <SketchCompass dark={dark} />
            <div style={{ fontSize: 11, fontWeight: 700, color: c.label, textTransform: 'uppercase', letterSpacing: 1 }}>Room Details</div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { label: 'Door faces...', value: doorDir, set: setDoorDir, opts: Object.entries(BAGUA).map(([d, v]) => ({ v: d, l: `${d} — ${v.area}` })) },
              { label: 'Room type...', value: roomType, set: setRoomType, opts: ROOM_TYPES.map((r) => ({ v: r, l: r })) },
              { label: 'Goal...', value: goal, set: setGoal, opts: GOALS.map((g) => ({ v: g, l: g })) },
            ].map(({ label, value, set, opts }) => (
              <div key={label} style={{ position: 'relative' }}>
                <select value={value} onChange={(e) => { set(e.target.value); setIsDemo(false) }} style={selectStyle}>
                  <option value="">{label}</option>
                  {opts.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke={c.label} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
          {bagua && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(180,140,60,0.07)', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(180,140,60,0.2)'}`, fontSize: 13, color: c.textMid }}>
              <span style={{ fontWeight: 700, color: EL_COLORS[bagua.element], fontFamily: "Georgia, serif" }}>{bagua.element}</span> element — {bagua.area}
            </div>
          )}
        </div>

        {/* Analyze button */}
        <button onClick={analyze} disabled={!canAnalyze} style={{ width: '100%', padding: '17px 0', borderRadius: 14, border: 'none', background: canAnalyze ? c.accent : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'), color: canAnalyze ? '#fff' : c.textSub, fontSize: 16, fontWeight: 600, cursor: canAnalyze ? 'pointer' : 'default', marginBottom: 14, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', transition: 'opacity 0.2s', boxShadow: canAnalyze ? '0 4px 20px rgba(0,113,227,0.3)' : 'none', fontFamily: "Georgia, serif", letterSpacing: 0.3 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}/>
              Reading the chi...
            </span>
          ) : isDemo ? 'Analyze your own room' : 'Analyze Room'}
        </button>

        {/* Error */}
        {error && (
          <div style={{ ...glass, padding: '13px 16px', marginBottom: 14, border: `1px solid ${c.errorBorder}`, background: c.errorBg, color: '#ef4444', fontSize: 14, borderRadius: 14 }}>
            {error}
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="fs-results-grid" style={{ display: 'grid', gap: 14, animation: 'fadeSlide 0.4s ease' }}>

            {/* Score card */}
            <div className="fs-score-card" style={{ ...glass, padding: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <SketchChiFlow dark={dark} score={analysis.overallScore}/>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 72, fontWeight: 800, color: analysis.overallScore >= 70 ? '#22c55e' : analysis.overallScore >= 45 ? '#f59e0b' : '#ef4444', lineHeight: 1, marginBottom: 4, fontFamily: "Georgia, serif" }}>{analysis.overallScore}</div>
                <div style={{ fontSize: 13, color: c.textSub, marginBottom: 20, letterSpacing: 0.5 }}>Chi Score</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, color: c.label, marginBottom: 3, letterSpacing: 0.8, textTransform: 'uppercase' }}>Energy</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: analysis.energyFlow === 'Good' ? '#22c55e' : analysis.energyFlow === 'Moderate' ? '#f59e0b' : '#ef4444' }}>{analysis.energyFlow}</div>
                  </div>
                  <div style={{ width: 1, background: c.divider }}/>
                  <div>
                    <div style={{ fontSize: 11, color: c.label, marginBottom: 3, letterSpacing: 0.8, textTransform: 'uppercase' }}>Command</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: analysis.commanding_position === 'Yes' ? '#22c55e' : analysis.commanding_position === 'Partial' ? '#f59e0b' : '#ef4444' }}>{analysis.commanding_position}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="fs-summary" style={{ ...glass, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.label, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Reading</div>
              <div style={{ fontSize: 15, color: c.textMid, lineHeight: 1.6, fontStyle: 'italic', fontFamily: "Georgia, serif" }}>{analysis.summary}</div>
            </div>

            {/* Element balance */}
            {analysis.elementBalance && (
              <div style={{ ...glass, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.label, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Element Balance</div>
                {Object.entries(analysis.elementBalance).map(([el, val]) => (
                  <div key={el} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: EL_COLORS[el], fontWeight: 700, fontFamily: "Georgia, serif" }}>{el}</span>
                      <span style={{ fontSize: 13, color: c.textSub }}>{val}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: c.barBg, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${val}%`, background: EL_COLORS[el], borderRadius: 3, transition: 'width 0.7s ease' }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Issues */}
            {analysis.issues?.length > 0 && (
              <div style={{ ...glass, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.label, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Issues Found</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {analysis.issues.map((issue, i) => (
                    <div key={i} style={{ padding: '14px 16px', borderRadius: 14, background: c.issueBg, border: `1px solid ${severityColor[issue.severity]}30` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: severityColor[issue.severity], flexShrink: 0 }}/>
                        <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{issue.title}</div>
                      </div>
                      <div style={{ fontSize: 13, color: c.textMid, marginBottom: 9, lineHeight: 1.5 }}>{issue.description}</div>
                      <div style={{ fontSize: 13, color: severityColor[issue.severity], fontWeight: 500, background: `${severityColor[issue.severity]}15`, padding: '7px 11px', borderRadius: 8, lineHeight: 1.4 }}>
                        Fix: {issue.fix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority actions */}
            {analysis.priorityActions?.length > 0 && (
              <div style={{ ...glass, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.label, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Priority Actions</div>
                {analysis.priorityActions.map((action, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < analysis.priorityActions.length - 1 ? 12 : 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "Georgia, serif" }}>{i + 1}</div>
                    <div style={{ fontSize: 14, color: c.textMid, lineHeight: 1.5, paddingTop: 3 }}>{action}</div>
                  </div>
                ))}
              </div>
            )}

            <button className="fs-reset" onClick={reset} style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: `1px solid ${c.btnSecBorder}`, background: c.btnSecBg, color: c.btnSecText, fontSize: 15, cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', fontFamily: 'inherit' }}>
              Analyze Another Room
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
