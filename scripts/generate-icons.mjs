/**
 * Genera icon-192.png y icon-512.png para la PWA FORGE.
 * Diseño: fondo oscuro (#0A0A0A) + letra "F" en rojo forja (#E24B4A).
 * Corre con: node scripts/generate-icons.mjs
 */
import { writeFileSync } from 'fs'
import { deflateSync } from 'zlib'

const BG = [10, 10, 10]       // #0A0A0A
const RED = [226, 75, 74]      // #E24B4A
const DARK = [17, 17, 17]      // #111111 (borde interior)

function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.allocUnsafe(4)
  len.writeUInt32BE(data.length)
  const crcData = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(crc32(crcData))
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

function makePNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB
  ihdr[10] = ihdr[11] = ihdr[12] = 0

  // Dibuja la "F" como rectángulos en coordenadas normalizadas
  const s = size
  const pad = Math.round(s * 0.18)        // margen exterior
  const strokeW = Math.round(s * 0.13)    // grosor de trazo
  const midBarH = Math.round(s * 0.11)    // alto de barra media
  const midBarY = Math.round(s * 0.46)    // Y de barra media
  const topBarW = Math.round(s * 0.60)    // ancho barra superior

  function getPixel(x, y) {
    // Margen redondeado de la card
    const r = Math.round(s * 0.15)
    const dx = Math.min(x, s - 1 - x)
    const dy = Math.min(y, s - 1 - y)
    if (dx < r && dy < r) {
      // Esquina: comprobar radio
      const cx = r, cy = r
      const qx = Math.min(x, s - 1 - x), qy = Math.min(y, s - 1 - y)
      if ((qx - r + 1) * (qx - r + 1) + (qy - r + 1) * (qy - r + 1) > r * r) return BG
    }

    // Palo vertical de la F
    if (x >= pad && x < pad + strokeW && y >= pad && y < s - pad) return RED
    // Barra superior
    if (y >= pad && y < pad + strokeW && x >= pad && x < pad + topBarW) return RED
    // Barra media
    if (y >= midBarY && y < midBarY + midBarH && x >= pad && x < pad + topBarW * 0.78) return RED

    return DARK
  }

  // Genera imagen pixel a pixel
  const rawRows = Buffer.alloc(s * (s * 3 + 1))
  let offset = 0
  for (let y = 0; y < s; y++) {
    rawRows[offset++] = 0 // filtro none
    for (let x = 0; x < s; x++) {
      const [r, g, b] = getPixel(x, y)
      rawRows[offset++] = r
      rawRows[offset++] = g
      rawRows[offset++] = b
    }
  }

  const compressed = deflateSync(rawRows, { level: 9 })

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

writeFileSync('public/icon-192.png', makePNG(192))
writeFileSync('public/icon-512.png', makePNG(512))
console.log('✓ public/icon-192.png generado')
console.log('✓ public/icon-512.png generado')
