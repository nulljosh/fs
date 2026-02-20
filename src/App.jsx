import { useState, useRef, useCallback, useMemo } from 'react'

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

// Element cycle: generating (Wood→Fire→Earth→Metal→Water→Wood)
// and controlling (Wood→Earth→Water→Fire→Metal→Wood)
const GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' }
const CONTROLS  = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' }

const GOAL_ELEMENT = {
  'Attract Wealth': 'Wood', 'Improve Relationships': 'Earth', 'Boost Career': 'Water',
  'Enhance Health': 'Wood', 'Increase Creativity': 'Metal', 'Find Peace & Calm': 'Water', 'Improve Sleep': 'Metal',
}

const ROOM_ELEMENT = {
  'Living Room': 'Fire', 'Bedroom': 'Earth', 'Office': 'Metal',
  'Kitchen': 'Fire', 'Dining Room': 'Earth', 'Bathroom': 'Water', 'Entryway': 'Wood',
}

const ROOM_ISSUES = {
  'Living Room': [
    { severity: 'moderate', title: 'Sofa placement', description: 'Seating that cannot see the main entrance weakens commanding position and reduces security.', fix: 'Angle the primary seat to face the door while maintaining conversation flow.' },
    { severity: 'minor', title: 'Sharp corners toward seating', description: 'Furniture edges pointing at seating areas create cutting chi (sha qi).', fix: 'Soften corners with plants or rounded throw pillows.' },
  ],
  'Bedroom': [
    { severity: 'moderate', title: 'Bed not in command position', description: 'Without a clear view of the door, restful sleep and sense of safety are reduced.', fix: 'Move the bed so you can see the door without being directly in line with it.' },
    { severity: 'minor', title: 'Mirrors facing the bed', description: 'Reflections during sleep disturb chi and create restlessness.', fix: 'Cover or reposition mirrors so they do not face the sleeping area.' },
  ],
  'Office': [
    { severity: 'critical', title: 'Desk facing a wall', description: 'Working with your back to the room scatters focus and blocks career chi.', fix: 'Turn the desk to face into the room, ideally with a wall behind you.' },
    { severity: 'minor', title: 'Clutter on desk surface', description: 'Accumulated objects block mental clarity and slow productivity.', fix: 'Keep only active items on the desk surface; file or remove the rest.' },
  ],
  'Kitchen': [
    { severity: 'moderate', title: 'Stove and sink too close', description: 'Fire and Water elements in direct conflict create tension and health imbalances.', fix: 'Place a Wood-element object (plant or green item) between them to mediate.' },
    { severity: 'minor', title: 'Hidden stove from entrance', description: 'A stove you cannot see when entering reduces prosperity chi.', fix: 'Hang a small mirror near the stove so it is reflected toward the entrance.' },
  ],
  'Dining Room': [
    { severity: 'minor', title: 'Chairs with backs to door', description: 'Guests seated facing away from the entrance feel unsettled, disrupting nourishing energy.', fix: 'Arrange seating so the host faces the entrance.' },
    { severity: 'minor', title: 'Overhead lighting too harsh', description: 'Bright direct light suppresses relaxed, nourishing chi during meals.', fix: 'Add a dimmer or switch to warm-toned bulbs.' },
  ],
  'Bathroom': [
    { severity: 'moderate', title: 'Toilet lid left open', description: 'Open drains pull wealth chi down and out of the home.', fix: 'Keep the toilet lid closed and the bathroom door shut when not in use.' },
    { severity: 'minor', title: 'Drain energy loss', description: 'Water draining out symbolizes energy and resources leaving.', fix: 'Add a potted plant or earth-toned decor to anchor chi in the space.' },
  ],
  'Entryway': [
    { severity: 'critical', title: 'Clutter at entrance', description: 'Blocked or cluttered entryways prevent chi from flowing freely into the home.', fix: 'Clear shoes, bags, and objects from the entry. Add a small console table to organize.' },
    { severity: 'minor', title: 'Dim lighting', description: 'Dark entryways suppress incoming energy and opportunity.', fix: 'Add brighter lighting or a mirror to amplify light near the entrance.' },
  ],
}

const GOAL_ACTIONS = {
  'Attract Wealth':        ['Activate the Southeast corner with a jade plant or amethyst cluster.', 'Add a small water feature on the North wall to feed Wood energy.', 'Keep the wealth corner clutter-free and well-lit.'],
  'Improve Relationships': ['Place rose quartz or paired objects in the Southwest corner.', 'Use earth tones (terracotta, sand, ochre) in shared spaces.', 'Remove single-subject art; favour imagery showing pairs or community.'],
  'Boost Career':          ['Add a water feature or dark blue accent in the North area.', 'Hang a metal wind chime near the front door to activate career chi.', 'Ensure your workspace faces the room, not a wall.'],
  'Enhance Health':        ['Bring live plants into the East area to strengthen Wood energy.', 'Maximise natural light; replace burnt-out bulbs immediately.', 'Remove dead or dried plants and replace with healthy ones.'],
  'Increase Creativity':   ['Add white or metallic accents in the West corner.', 'Keep a dedicated creative surface clear and ready to use.', 'Hang round or oval-shaped art in the West to activate Metal chi.'],
  'Find Peace & Calm':     ['Use soft earth and water tones throughout — sage, slate, cream.', 'Remove or cover screens in the bedroom.', 'Add a small tabletop fountain to bring calming Water energy.'],
  'Improve Sleep':         ['Ensure the bed headboard is against a solid wall with no window directly behind.', 'Remove electronic devices or cover them at night.', 'Use blackout curtains and keep the room cool and clutter-free.'],
}

function buildAnalysis(doorDir, roomType, goal) {
  const doorEl  = BAGUA[doorDir]?.element
  const goalEl  = GOAL_ELEMENT[goal]
  const roomEl  = ROOM_ELEMENT[roomType]

  // Score: base 55, +10 if door element generates goal element, +8 if room suits goal, -5 conflicts
  let score = 55
  if (doorEl && goalEl) {
    if (GENERATES[doorEl] === goalEl) score += 12
    else if (doorEl === goalEl) score += 8
    else if (CONTROLS[doorEl] === goalEl) score -= 8
  }
  if (roomEl && goalEl) {
    if (GENERATES[roomEl] === goalEl || roomEl === goalEl) score += 8
    else if (CONTROLS[roomEl] === goalEl) score -= 5
  }
  score = Math.min(92, Math.max(38, score))

  const energyFlow = score >= 72 ? 'Good' : score >= 50 ? 'Moderate' : 'Blocked'
  const commanding_position = score >= 68 ? 'Yes' : score >= 50 ? 'Partial' : 'No'

  const baguaInfo = BAGUA[doorDir] || { element: 'Earth', area: 'Balance' }
  const summary = `Your ${roomType.toLowerCase()} has a ${doorDir}-facing entrance, activating ${baguaInfo.element} energy aligned with ${baguaInfo.area}. ${
    energyFlow === 'Good'
      ? `Chi flows well through this space — your goal to ${goal.toLowerCase()} is strongly supported by the current elemental alignment.`
      : energyFlow === 'Moderate'
      ? `Energy flow is moderate. Addressing the issues below will meaningfully strengthen chi and better support your goal to ${goal.toLowerCase()}.`
      : `Chi is currently blocked. The elemental tensions between your entrance direction and goal need attention — the actions below will help redirect energy flow.`
  }`

  const issues = ROOM_ISSUES[roomType] || []

  // Element balance: weight toward door + goal elements
  const base = { Wood: 18, Fire: 18, Earth: 18, Metal: 18, Water: 18 }
  if (doorEl) base[doorEl] = (base[doorEl] || 0) + 14
  if (goalEl) base[goalEl] = (base[goalEl] || 0) + 8
  if (roomEl) base[roomEl] = (base[roomEl] || 0) + 6
  const total = Object.values(base).reduce((a, b) => a + b, 0)
  const elementBalance = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, Math.round(v / total * 100)]))

  return {
    overallScore: score,
    energyFlow,
    commanding_position,
    summary,
    issues,
    priorityActions: GOAL_ACTIONS[goal] || [],
    elementBalance,
  }
}

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
  const [images, setImages] = useState(DEMO.images.map((img) => ({ url: img.url, base64: null, mediaType: 'image/jpeg', demoLabel: img.label })))
  const [doorDir, setDoorDir] = useState(DEMO.doorDir)
  const [roomType, setRoomType] = useState(DEMO.roomType)
  const [goal, setGoal] = useState(DEMO.goal)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState(DEMO.analysis)
  const [isDemo, setIsDemo] = useState(true)
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
    setImages((prev) => (isDemo ? [] : prev).concat(processed).slice(0, 5))
    if (isDemo) { setAnalysis(null); setError(null); setDoorDir(''); setRoomType(''); setGoal('') }
    setIsDemo(false)
  }, [isDemo])

  const removeImage = (idx) => { setImages((prev) => prev.filter((_, i) => i !== idx)); setIsDemo(false) }

  const reset = () => {
    setAnalysis(null); setImages([]); setDoorDir(''); setRoomType(''); setGoal(''); setError(null); setIsDemo(false)
  }

  const analyze = async () => {
    if (!images.length || !doorDir || !roomType || !goal) return
    setLoading(true); setError(null); setAnalysis(null); setIsDemo(false)
    await new Promise((r) => setTimeout(r, 200))
    setAnalysis(buildAnalysis(doorDir, roomType, goal))
    setLoading(false)
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

      {/* Content */}
      <div className="fs-container" style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 480, margin: '0 auto', paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>

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
