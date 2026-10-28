// Brand asset generator.
//
// Renders the favicon set, PWA icons and the social card from the sources in
// scripts/brand/ using the Playwright Chromium already installed for e2e tests.
// favicon.ico is assembled in plain Node (PNG-in-ICO), so no extra dependency.
//
// Usage (from the repo root): npm run icons

import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import { chromium } from '@playwright/test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const brandDir = join(root, 'scripts', 'brand')
const publicDir = join(root, 'public')
const fontFile = join(root, 'node_modules', '@fontsource-variable', 'inter', 'files', 'inter-latin-wght-normal.woff2')

const manifest = {
  name: 'Laravel Vue SPA',
  short_name: 'LV SPA',
  start_url: '/',
  display: 'standalone',
  background_color: '#0B1020',
  theme_color: '#4F46E5',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}

function extract (svg, pattern, label) {
  const match = svg.match(pattern)
  if (!match) throw new Error(`mark.svg: could not find ${label}`)
  return match[0]
}

// Builds a square SVG document from the mark parts.
// fullBleed: square tile without rounded corners (apple-touch, maskable).
// scale: monogram scale around the center (safe zone for maskable icons).
function buildSvg ({ defs, monogram }, { size, fullBleed = false, scale = 1 }) {
  const tile = fullBleed
    ? '<rect width="64" height="64" fill="url(#lv-grad)"/>'
    : '<rect width="64" height="64" rx="14" fill="url(#lv-grad)"/>'
  const offset = 32 * (1 - scale)
  const group = scale === 1
    ? monogram
    : `<g transform="translate(${offset} ${offset}) scale(${scale})">${monogram}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">${defs}${tile}${group}</svg>`
}

async function renderSvg (page, svg, size, { transparent }) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`
  )
  return page.screenshot({
    type: 'png',
    omitBackground: transparent,
    clip: { x: 0, y: 0, width: size, height: size }
  })
}

// ICO container with PNG-compressed images (supported since Windows Vista and
// by every current browser).
function buildIco (images) {
  const headerSize = 6
  const entrySize = 16
  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  let offset = headerSize + entrySize * images.length
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(entrySize)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette colors
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // color planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...images.map(image => image.data)])
}

async function write (file, data) {
  await writeFile(file, data)
  console.log(`  wrote ${relative(root, file).replace(/\\/g, '/')} (${data.length} bytes)`)
}

async function main () {
  const markSvg = await readFile(join(brandDir, 'mark.svg'), 'utf8')
  const parts = {
    defs: extract(markSvg, /<defs>[\s\S]*?<\/defs>/, '<defs>'),
    monogram: extract(markSvg, /<g id="monogram"[\s\S]*?<\/g>/, '<g id="monogram">')
  }

  await mkdir(publicDir, { recursive: true })
  console.log('Generating brand assets')

  await copyFile(join(brandDir, 'mark.svg'), join(publicDir, 'favicon.svg'))
  console.log('  copied scripts/brand/mark.svg -> public/favicon.svg')

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 })

    // Transparent rounded tile: favicon.ico and the "any" purpose PWA icons.
    const tile = size => renderSvg(page, buildSvg(parts, { size }), size, { transparent: true })

    const icoImages = []
    for (const size of [16, 32, 48]) {
      icoImages.push({ size, data: await tile(size) })
    }
    await write(join(publicDir, 'favicon.ico'), buildIco(icoImages))

    await write(join(publicDir, 'icon-192.png'), await tile(192))
    await write(join(publicDir, 'icon-512.png'), await tile(512))

    // Opaque, full-bleed: iOS applies its own corner mask.
    await write(
      join(publicDir, 'apple-touch-icon.png'),
      await renderSvg(page, buildSvg(parts, { size: 180, fullBleed: true, scale: 0.92 }), 180, { transparent: false })
    )

    // Maskable: monogram kept well inside the 80% safe-zone circle.
    await write(
      join(publicDir, 'icon-maskable-512.png'),
      await renderSvg(page, buildSvg(parts, { size: 512, fullBleed: true, scale: 0.8 }), 512, { transparent: false })
    )

    // Social card.
    const font = await readFile(fontFile)
    const markInline = buildSvg(parts, { size: 104 })
    const html = (await readFile(join(brandDir, 'og.html'), 'utf8'))
      .replace('{{FONT_URL}}', () => `data:font/woff2;base64,${font.toString('base64')}`)
      .replace('{{MARK}}', () => markInline)
      .replace('{{MONOGRAM}}', () => parts.monogram.replace(/stroke="#[0-9A-Fa-f]{6}"/g, 'stroke="#C7D2FE"'))
    await page.setViewportSize({ width: 1200, height: 630 })
    await page.setContent(html, { waitUntil: 'load' })
    const fontOk = await page.evaluate(async () => {
      await document.fonts.load('800 84px Inter')
      await document.fonts.ready
      return document.fonts.check('800 84px Inter')
    })
    if (!fontOk) throw new Error('og.html: Inter did not load')
    await write(
      join(publicDir, 'og-image.png'),
      await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } })
    )
  } finally {
    await browser.close()
  }

  await write(join(publicDir, 'site.webmanifest'), Buffer.from(JSON.stringify(manifest, null, 2) + '\n'))
  console.log('Done.')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
