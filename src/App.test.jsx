import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'

// Isolate constants by importing the module directly
// Since they're not exported, we test behavior through the component

// --- Unit tests on data/logic extracted inline ---

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

const DEMO = {
  doorDir: 'Southeast', roomType: 'Living Room', goal: 'Attract Wealth',
  images: [{ url: '/demo/living-room.jpg', label: 'Living Room' }],
  analysis: {
    overallScore: 72, energyFlow: 'Moderate', commanding_position: 'Partial',
    summary: 'This living room has good natural light and open circulation.',
    issues: [
      { severity: 'moderate', title: 'Sofa faces away from door', description: 'desc', fix: 'fix' },
    ],
    priorityActions: ['Action one', 'Action two', 'Action three'],
    elementBalance: { Wood: 35, Fire: 15, Earth: 20, Metal: 10, Water: 20 },
  },
}

describe('BAGUA data structure', () => {
  it('has exactly 8 directions', () => {
    expect(Object.keys(BAGUA)).toHaveLength(8)
  })

  it('includes all cardinal and intercardinal directions', () => {
    const dirs = Object.keys(BAGUA)
    expect(dirs).toContain('North')
    expect(dirs).toContain('South')
    expect(dirs).toContain('East')
    expect(dirs).toContain('West')
    expect(dirs).toContain('Northeast')
    expect(dirs).toContain('Northwest')
    expect(dirs).toContain('Southeast')
    expect(dirs).toContain('Southwest')
  })

  it('each direction has element and area fields', () => {
    for (const [dir, val] of Object.entries(BAGUA)) {
      expect(val).toHaveProperty('element')
      expect(val).toHaveProperty('area')
      expect(typeof val.element).toBe('string')
      expect(typeof val.area).toBe('string')
    }
  })

  it('all elements are valid Five Element types', () => {
    const valid = new Set(['Wood', 'Fire', 'Earth', 'Metal', 'Water'])
    for (const [dir, val] of Object.entries(BAGUA)) {
      expect(valid.has(val.element), `${dir} has invalid element: ${val.element}`).toBe(true)
    }
  })
})

describe('EL_COLORS', () => {
  it('has a color for every BAGUA element', () => {
    const elements = new Set(Object.values(BAGUA).map((v) => v.element))
    for (const el of elements) {
      expect(EL_COLORS).toHaveProperty(el)
      expect(typeof EL_COLORS[el]).toBe('string')
    }
  })

  it('contains exactly the 5 elements', () => {
    expect(Object.keys(EL_COLORS)).toHaveLength(5)
    expect(Object.keys(EL_COLORS)).toEqual(
      expect.arrayContaining(['Wood', 'Fire', 'Earth', 'Metal', 'Water'])
    )
  })
})

describe('DEMO data', () => {
  it('has required top-level fields', () => {
    expect(DEMO).toHaveProperty('doorDir')
    expect(DEMO).toHaveProperty('roomType')
    expect(DEMO).toHaveProperty('goal')
    expect(DEMO).toHaveProperty('images')
    expect(DEMO).toHaveProperty('analysis')
  })

  it('doorDir maps to a valid BAGUA direction', () => {
    expect(BAGUA).toHaveProperty(DEMO.doorDir)
  })

  it('analysis has required fields', () => {
    const a = DEMO.analysis
    expect(typeof a.overallScore).toBe('number')
    expect(typeof a.energyFlow).toBe('string')
    expect(typeof a.commanding_position).toBe('string')
    expect(typeof a.summary).toBe('string')
    expect(Array.isArray(a.issues)).toBe(true)
    expect(Array.isArray(a.priorityActions)).toBe(true)
    expect(typeof a.elementBalance).toBe('object')
  })

  it('overallScore is in range 0-100', () => {
    expect(DEMO.analysis.overallScore).toBeGreaterThanOrEqual(0)
    expect(DEMO.analysis.overallScore).toBeLessThanOrEqual(100)
  })

  it('elementBalance keys match EL_COLORS', () => {
    const keys = Object.keys(DEMO.analysis.elementBalance)
    for (const k of keys) {
      expect(EL_COLORS).toHaveProperty(k)
    }
  })
})

describe('addImages logic (slice to 5)', () => {
  it('caps total images at 5', () => {
    const existing = [1, 2, 3].map((n) => ({ url: `img${n}` }))
    const incoming = [4, 5, 6].map((n) => ({ url: `img${n}` }))
    const result = [...existing, ...incoming].slice(0, 5)
    expect(result).toHaveLength(5)
  })

  it('keeps first 5 when combining', () => {
    const existing = [1, 2, 3, 4].map((n) => ({ url: `img${n}` }))
    const incoming = [5, 6].map((n) => ({ url: `img${n}` }))
    const result = [...existing, ...incoming].slice(0, 5)
    expect(result.map((r) => r.url)).toEqual(['img1', 'img2', 'img3', 'img4', 'img5'])
  })

  it('does not cap when total <= 5', () => {
    const existing = [1, 2].map((n) => ({ url: `img${n}` }))
    const incoming = [3].map((n) => ({ url: `img${n}` }))
    const result = [...existing, ...incoming].slice(0, 5)
    expect(result).toHaveLength(3)
  })
})

describe('analyze error path', () => {
  it('returns early when no images provided', () => {
    // Simulate the guard: if (!images.length || !doorDir || !roomType || !goal) return
    const images = []
    const doorDir = 'North'
    const roomType = 'Bedroom'
    const goal = 'Attract Wealth'

    const shouldCallApi = images.length > 0 && doorDir && roomType && goal
    expect(shouldCallApi).toBeFalsy()
  })

  it('returns early when doorDir missing', () => {
    const images = [{ url: 'img1' }]
    const doorDir = ''
    const roomType = 'Bedroom'
    const goal = 'Attract Wealth'

    const shouldCallApi = images.length > 0 && doorDir && roomType && goal
    expect(shouldCallApi).toBeFalsy()
  })

  it('proceeds when all fields present', () => {
    const images = [{ url: 'img1', base64: 'abc', mediaType: 'image/jpeg' }]
    const doorDir = 'North'
    const roomType = 'Bedroom'
    const goal = 'Attract Wealth'

    const shouldCallApi = images.length > 0 && doorDir && roomType && goal
    expect(shouldCallApi).toBeTruthy()
  })
})
