import { useState, useRef, useCallback } from 'react';
import './App.css';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function extractColors(canvas, img) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);

  const data = ctx.getImageData(0, 0, size, size).data;
  const step = 4; // sample every 4th pixel
  const colorCounts = {};

  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const i = (y * size + x) * 4;
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const hex = '#' +
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');
      colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    }
  }

  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex]) => hex);
}

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [colors, setColors] = useState([]);
  const [direction, setDirection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const handleImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return; }

    setResults(null);
    setError(null);

    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setImage(file);

    const img = new Image();
    img.onload = () => {
      const extracted = extractColors(canvasRef.current, img);
      setColors(extracted);
    };
    img.src = url;
  }, []);

  const analyze = useCallback(async () => {
    if (!colors.length || !direction) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors, direction })
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [colors, direction]);

  const scoreColor = (score) => {
    if (score >= 80) return '#4a6741';
    if (score >= 60) return '#6b8f5e';
    if (score >= 40) return '#c4a34d';
    return '#a85432';
  };

  const elementIcons = {
    Wood: '\u{1F332}',
    Fire: '\u{1F525}',
    Earth: '\u{26F0}',
    Metal: '\u{2699}',
    Water: '\u{1F4A7}'
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Chi Scan</h1>
        <p className="subtitle">Feng Shui Analyzer</p>
      </header>

      <section className="card upload-card">
        <h2 className="card-title">Room Photo</h2>
        <p className="card-desc">Upload or capture a photo of your room</p>
        <button className="upload-btn" onClick={() => fileRef.current?.click()}>
          {preview ? 'Change Photo' : 'Select Photo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImage}
          className="file-input"
        />
        {preview && (
          <div className="preview-wrap">
            <img src={preview} alt="Room preview" className="preview-img" />
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </section>

      {colors.length > 0 && (
        <section className="card colors-card">
          <h2 className="card-title">Detected Colors</h2>
          <div className="color-swatches">
            {colors.map((c, i) => (
              <div key={i} className="swatch-item">
                <div className="swatch" style={{ backgroundColor: c }} />
                <span className="swatch-label">{c}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {colors.length > 0 && (
        <section className="card direction-card">
          <h2 className="card-title">Room Facing Direction</h2>
          <p className="card-desc">Select the compass direction the room faces</p>
          <div className="compass-grid">
            {DIRECTIONS.map((d) => (
              <button
                key={d}
                className={`compass-btn ${direction === d ? 'active' : ''}`}
                onClick={() => setDirection(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </section>
      )}

      {colors.length > 0 && direction && (
        <button
          className="analyze-btn"
          onClick={analyze}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Feng Shui'}
        </button>
      )}

      {error && (
        <div className="card error-card">
          <p>{error}</p>
        </div>
      )}

      {results && (
        <section className="card results-card">
          <h2 className="card-title">Analysis</h2>

          <div className="score-section">
            <div className="score-ring" style={{ '--score-color': scoreColor(results.score) }}>
              <svg viewBox="0 0 120 120" className="score-svg">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e0e6ec" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={scoreColor(results.score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(results.score / 100) * 327} 327`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="score-value">{results.score}</div>
            </div>
            <p className="score-label">Chi Score</p>
          </div>

          <div className="elements-section">
            <h3 className="section-title">Five Elements</h3>
            <div className="elements-grid">
              {Object.entries(results.elements).map(([name, pct]) => (
                <div key={name} className="element-item">
                  <span className="element-icon">{elementIcons[name]}</span>
                  <span className="element-name">{name}</span>
                  <div className="element-bar-bg">
                    <div
                      className="element-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="element-pct">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {results.analysis && (
            <div className="analysis-text">
              <p>{results.analysis}</p>
            </div>
          )}

          {results.recommendations?.length > 0 && (
            <div className="recs-section">
              <h3 className="section-title">Recommendations</h3>
              <ul className="recs-list">
                {results.recommendations.map((r, i) => (
                  <li key={i} className="rec-item">{r}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <footer className="footer">
        <p>Based on traditional Five Element theory</p>
      </footer>
    </div>
  );
}
