// Generates public/icon-192.png, icon-512.png, apple-touch-icon.png
// Pure Node.js — no dependencies required
// Run: node generate-icons.mjs

import { createWriteStream } from 'fs'
import { deflateSync } from 'zlib'

function crc32(buf) {
  let crc = 0xFFFFFFFF
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function makePNG(size, stops) {
  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type RGB
  // scanlines
  const rows = []
  for (let y = 0; y < size; y++) {
    const t = y / (size - 1)
    // gradient interpolation through stops
    let r, g, b
    if (t <= 0.5) {
      const u = t * 2
      r = Math.round(stops[0][0] + (stops[1][0] - stops[0][0]) * u)
      g = Math.round(stops[0][1] + (stops[1][1] - stops[0][1]) * u)
      b = Math.round(stops[0][2] + (stops[1][2] - stops[0][2]) * u)
    } else {
      const u = (t - 0.5) * 2
      r = Math.round(stops[1][0] + (stops[2][0] - stops[1][0]) * u)
      g = Math.round(stops[1][1] + (stops[2][1] - stops[1][1]) * u)
      b = Math.round(stops[1][2] + (stops[2][2] - stops[1][2]) * u)
    }
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0 // filter type None
    for (let x = 0; x < size; x++) {
      // circular mask
      const cx = x - size / 2, cy = y - size / 2
      const dist = Math.sqrt(cx * cx + cy * cy) / (size / 2)
      const alpha = dist > 1 ? 0 : 1
      const pr = Math.min(255, Math.round(r * alpha + 223 * (1 - alpha)))
      const pg = Math.min(255, Math.round(g * alpha + 233 * (1 - alpha)))
      const pb = Math.min(255, Math.round(b * alpha + 243 * (1 - alpha)))
      row[1 + x * 3] = pr
      row[2 + x * 3] = pg
      row[3 + x * 3] = pb
    }
    rows.push(row)
  }
  const raw = Buffer.concat(rows)
  const compressed = deflateSync(raw, { level: 6 })

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Blue-purple gradient (matches app accent)
const stops = [[100, 140, 255], [130, 100, 255], [100, 160, 255]]

const icons = [
  { path: 'public/icon-192.png', size: 192 },
  { path: 'public/icon-512.png', size: 512 },
  { path: 'public/apple-touch-icon.png', size: 180 },
]

for (const { path, size } of icons) {
  const buf = makePNG(size, stops)
  const ws = createWriteStream(path)
  ws.write(buf)
  ws.end()
  console.log(`Generated ${path} (${size}x${size})`)
}
