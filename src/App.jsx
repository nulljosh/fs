import { useState, useRef, useCallback, useEffect } from 'react'

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

const EL_COLORS = {
  Wood: '#22c55e',
  Fire: '#ef4444',
  Earth: '#f59e0b',
  Metal: '#94a3b8',
  Water: '#60a5fa',
}

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Office', 'Kitchen', 'Dining Room', 'Bathroom', 'Entryway']
const GOALS = ['Attract Wealth', 'Improve Relationships', 'Boost Career', 'Enhance Health', 'Increase Creativity', 'Find Peace & Calm', 'Improve Sleep']

const glass = {
  background: 'rgba(255,255,255,0.45)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 8px 32px rgba(120,160,220,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
  borderRadius: 20,
}

const selectStyle = {
  width: '100%',
  padding: '14px 16px',
  fontSize: 16,
  fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
  color: 'rgba(0,0,0,0.75)',
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(255,255,255,0.7)',
  borderRadius: 12,
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
}

export default function App() {
  const [images, setImages] = useState([])
  const [doorDir, setDoorDir] = useState('')
  const [roomType, setRoomType] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('fs_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const fileRef = useRef(null)

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
      url: URL.createObjectURL(f),
      base64: await toBase64.current(f),
      mediaType: f.type || 'image/jpeg',
    })))
    setImages((prev) => [...prev, ...processed].slice(0, 5))
  }, [])

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx))

  const saveKey = (k) => {
    setApiKey(k)
    localStorage.setItem('fs_api_key', k)
    setShowKeyInput(false)
  }

  const analyze = async () => {
    if (!images.length || !doorDir || !roomType || !goal) return
    if (!apiKey) { setShowKeyInput(true); return }
    setLoading(true); setError(null); setAnalysis(null)
    try {
      let res
      try {
        res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: `You are a feng shui master. Analyze room photos and respond ONLY in valid JSON:
{"overallScore":number,"energyFlow":"Good|Moderate|Blocked","commanding_position":"Yes|No|Partial",
"summary":"2-3 sentences","issues":[{"severity":"critical|moderate|minor","title":"string",
"description":"string","fix":"string"}],"priorityActions":["string","string","string"],
"elementBalance":{"Wood":number,"Fire":number,"Earth":number,"Metal":number,"Water":number}}`,
            messages: [{
              role: 'user',
              content: [
                ...images.map((img) => ({
                  type: 'image',
                  source: { type: 'base64', media_type: img.mediaType, data: img.base64 }
                })),
                { type: 'text', text: `Analyze this ${roomType}. Door faces ${doorDir}. Goal: ${goal}. JSON only.` }
              ]
            }]
          })
        })
      } catch {
        throw new Error('Network error — check your internet connection.')
      }
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
      try { parsed = JSON.parse(clean) }
      catch { throw new Error('Could not parse response — try again.') }
      if (typeof parsed.overallScore !== 'number') throw new Error('Malformed response — try again.')
      setAnalysis(parsed)
    } catch (err) {
      setError(err.message || 'Analysis failed — try again.')
    } finally {
      setLoading(false)
    }
  }

  const bagua = BAGUA[doorDir]
  const canAnalyze = images.length > 0 && doorDir && roomType && goal && !loading

  const severityColor = { critical: '#ef4444', moderate: '#f59e0b', minor: '#22c55e' }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #dfe9f3, #e8f0f7, #f0e8f5, #f5f0e8)',
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      overscrollBehavior: 'none',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated blobs */}
      <style>{`
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
      `}</style>
      {[
        { top: '-15%', left: '-10%', width: 400, height: 400, colors: 'radial-gradient(circle, rgba(100,180,255,0.35), transparent 70%)', delay: '0s' },
        { top: '40%', right: '-15%', width: 350, height: 350, colors: 'radial-gradient(circle, rgba(200,150,255,0.3), transparent 70%)', delay: '-3s' },
        { bottom: '-10%', left: '20%', width: 300, height: 300, colors: 'radial-gradient(circle, rgba(150,220,180,0.3), transparent 70%)', delay: '-6s' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'fixed',
          top: b.top, left: b.left, right: b.right, bottom: b.bottom,
          width: b.width, height: b.height,
          background: b.colors,
          filter: 'blur(60px)',
          animation: `blobFloat 8s ease-in-out ${b.delay} infinite`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '14px 20px',
        paddingTop: 'max(14px, env(safe-area-inset-top))',
        ...glass,
        borderRadius: 0,
        borderBottom: '1px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(0,0,0,0.85)', letterSpacing: -0.3 }}>Chi Scan</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', marginTop: 1 }}>Feng Shui Analyzer</div>
        </div>
        <button onClick={() => setShowKeyInput(true)} style={{
          background: 'rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 10,
          padding: '6px 12px',
          fontSize: 13,
          color: apiKey ? '#22c55e' : 'rgba(0,0,0,0.5)',
          cursor: 'pointer',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}>
          {apiKey ? 'Key set' : 'Add API key'}
        </button>
      </div>

      {/* API Key Modal */}
      {showKeyInput && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setShowKeyInput(false)}>
          <div style={{ ...glass, padding: 24, width: '100%', maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.8)', marginBottom: 8 }}>Anthropic API Key</div>
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', marginBottom: 16 }}>
              Stored locally in your browser. Never sent anywhere except Anthropic.
            </div>
            <input
              autoFocus
              type="password"
              defaultValue={apiKey}
              placeholder="sk-ant-..."
              onKeyDown={(e) => e.key === 'Enter' && saveKey(e.target.value)}
              style={{ ...selectStyle, marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowKeyInput(false)} style={{
                flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)',
                background: 'rgba(0,0,0,0.04)', fontSize: 15, color: 'rgba(0,0,0,0.6)', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={(e) => saveKey(e.target.closest('div').previousElementSibling.value)} style={{
                flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, rgba(100,160,255,0.9), rgba(160,100,255,0.9))',
                fontSize: 15, color: '#fff', fontWeight: 600, cursor: 'pointer',
              }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 480, margin: '0 auto', paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>

        {/* Upload */}
        <div style={{ ...glass, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Room Photos</div>

          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.8)' }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImage(i)} style={{
                    position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
                    lineHeight: 1,
                  }}>x</button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,image/heic"
            capture="environment"
            multiple
            onChange={(e) => addImages(e.target.files)}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileRef.current?.click()} style={{
            width: '100%', padding: '16px 0', borderRadius: 14,
            border: '1.5px dashed rgba(100,160,255,0.5)',
            background: 'rgba(100,160,255,0.06)',
            color: 'rgba(100,160,255,0.9)', fontSize: 15, fontWeight: 500,
            cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
          }}>
            {images.length === 0 ? 'Take photo or upload' : `Add more (${images.length}/5)`}
          </button>
        </div>

        {/* Selects */}
        <div style={{ ...glass, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Room Details</div>

          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <select value={doorDir} onChange={(e) => setDoorDir(e.target.value)} style={selectStyle}>
                <option value="">Door faces...</option>
                {Object.keys(BAGUA).map((d) => (
                  <option key={d} value={d}>{d} — {BAGUA[d].area}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(0,0,0,0.3)', fontSize: 12 }}>v</div>
            </div>

            <div style={{ position: 'relative' }}>
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={selectStyle}>
                <option value="">Room type...</option>
                {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(0,0,0,0.3)', fontSize: 12 }}>v</div>
            </div>

            <div style={{ position: 'relative' }}>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} style={selectStyle}>
                <option value="">Goal...</option>
                {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(0,0,0,0.3)', fontSize: 12 }}>v</div>
            </div>
          </div>

          {bagua && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(100,160,255,0.08)', border: '1px solid rgba(100,160,255,0.15)',
              fontSize: 13, color: 'rgba(0,0,0,0.55)',
            }}>
              <span style={{ fontWeight: 600, color: EL_COLORS[bagua.element] }}>{bagua.element}</span> element — {bagua.area}
            </div>
          )}
        </div>

        {/* Analyze button */}
        <button onClick={analyze} disabled={!canAnalyze} style={{
          width: '100%', padding: '18px 0', borderRadius: 16, border: 'none',
          background: canAnalyze
            ? 'linear-gradient(135deg, rgba(100,160,255,0.9), rgba(160,100,255,0.9))'
            : 'rgba(0,0,0,0.1)',
          color: canAnalyze ? '#fff' : 'rgba(0,0,0,0.3)',
          fontSize: 17, fontWeight: 600, cursor: canAnalyze ? 'pointer' : 'default',
          marginBottom: 16, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
          transition: 'opacity 0.2s',
          boxShadow: canAnalyze ? '0 4px 20px rgba(100,160,255,0.35)' : 'none',
        }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{
                width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
              Analyzing...
            </span>
          ) : 'Analyze Room'}
        </button>

        {/* Error */}
        {error && (
          <div style={{
            ...glass, padding: '14px 16px', marginBottom: 16,
            border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)',
            color: '#ef4444', fontSize: 14, borderRadius: 14,
          }}>
            {error}
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div style={{ display: 'grid', gap: 14 }}>
            {/* Score card */}
            <div style={{ ...glass, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 64, fontWeight: 800, color: analysis.overallScore >= 70 ? '#22c55e' : analysis.overallScore >= 45 ? '#f59e0b' : '#ef4444', lineHeight: 1, marginBottom: 6 }}>
                {analysis.overallScore}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', marginBottom: 16 }}>Chi Score</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', marginBottom: 2 }}>Energy</div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: analysis.energyFlow === 'Good' ? '#22c55e' : analysis.energyFlow === 'Moderate' ? '#f59e0b' : '#ef4444'
                  }}>{analysis.energyFlow}</div>
                </div>
                <div style={{ width: 1, background: 'rgba(0,0,0,0.08)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', marginBottom: 2 }}>Command</div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: analysis.commanding_position === 'Yes' ? '#22c55e' : analysis.commanding_position === 'Partial' ? '#f59e0b' : '#ef4444'
                  }}>{analysis.commanding_position}</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ ...glass, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Reading</div>
              <div style={{ fontSize: 15, color: 'rgba(0,0,0,0.7)', lineHeight: 1.55 }}>{analysis.summary}</div>
            </div>

            {/* Element balance */}
            {analysis.elementBalance && (
              <div style={{ ...glass, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Element Balance</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {Object.entries(analysis.elementBalance).map(([el, val]) => (
                    <div key={el}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: EL_COLORS[el], fontWeight: 600 }}>{el}</span>
                        <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>{val}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${val}%`, background: EL_COLORS[el], borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues */}
            {analysis.issues?.length > 0 && (
              <div style={{ ...glass, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Issues Found</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {analysis.issues.map((issue, i) => (
                    <div key={i} style={{
                      padding: '14px 16px', borderRadius: 14,
                      background: 'rgba(0,0,0,0.03)', border: `1px solid ${severityColor[issue.severity]}22`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: severityColor[issue.severity], flexShrink: 0 }} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.75)' }}>{issue.title}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', marginBottom: 8, lineHeight: 1.45 }}>{issue.description}</div>
                      <div style={{ fontSize: 13, color: severityColor[issue.severity], fontWeight: 500, background: `${severityColor[issue.severity]}0f`, padding: '6px 10px', borderRadius: 8 }}>
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
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Priority Actions</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {analysis.priorityActions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(100,160,255,0.8), rgba(160,100,255,0.8))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#fff',
                      }}>{i + 1}</div>
                      <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', lineHeight: 1.45, paddingTop: 3 }}>{action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset */}
            <button onClick={() => { setAnalysis(null); setImages([]); setDoorDir(''); setRoomType(''); setGoal(''); }} style={{
              width: '100%', padding: '16px 0', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)',
              background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.5)', fontSize: 15, cursor: 'pointer',
              touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
            }}>
              Analyze Another Room
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
