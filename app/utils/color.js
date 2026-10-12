// Full Tailwind background classes are listed as literals so the Tailwind
// scanner detects and generates them (dynamically built class strings would be
// purged). Keyed by shade token so call sites can pick the shade they need.
//
// Hue order matches the native app's `EntityAvatar` palette (red, orange,
// yellow, green, mint, teal, cyan, blue, indigo, purple, pink) so the same
// entity resolves to the same hue on both platforms.
const COLOR_PALETTES = {
  '200!': ['bg-red-200!', 'bg-orange-200!', 'bg-amber-200!', 'bg-green-200!', 'bg-emerald-200!', 'bg-teal-200!', 'bg-cyan-200!', 'bg-blue-200!', 'bg-indigo-200!', 'bg-purple-200!', 'bg-pink-200!'],
  50: ['bg-red-50', 'bg-orange-50', 'bg-amber-50', 'bg-green-50', 'bg-emerald-50', 'bg-teal-50', 'bg-cyan-50', 'bg-blue-50', 'bg-indigo-50', 'bg-purple-50', 'bg-pink-50']
}

// Returns a deterministic Tailwind background class for a name — the same
// name always gets the same colour across reloads. The hash (sum of Unicode
// code points modulo palette size) matches the native app's `EntityAvatar`
// so avatars keep the same hue in the webapp and the app.
export function nameColor (name = '', shade = '200!') {
  const palette = COLOR_PALETTES[shade] || COLOR_PALETTES['200!']

  let hash = 0
  for (const character of String(name ?? '')) {
    hash += character.codePointAt(0)
  }

  return palette[hash % palette.length]
}

// Cover colors per entity id for this session, so a revisited entity paints its header at once.
const coverColors = new Map()

// Returns a CSS gradient of the hue derived from an id — the same hash and stops as the native app's `derivedGradient`, run horizontally so the toolbar strip and header band join seamlessly.
export function derivedGradient (id = '') {
  const hue = derivedHue(id)
  const from = hsvToRgb(hue, 0.68, 0.62)
  const to = hsvToRgb((hue + 0.06) % 1, 0.56, 0.84)

  return `linear-gradient(to right, ${rgbToCss(from)}, ${rgbToCss(to)})`
}

// Returns a CSS gradient for a cover color, darkened toward the leading stop like the native app's `coverHeaderGradient`, run horizontally.
export function coverGradient ({ red, green, blue }) {
  const from = { red: red * 0.55, green: green * 0.55, blue: blue * 0.55 }
  const to = { red: Math.min(red * 1.2, 1), green: Math.min(green * 1.2, 1), blue: Math.min(blue * 1.2, 1) }

  return `linear-gradient(to right, ${rgbToCss(from)}, ${rgbToCss(to)})`
}

// Returns the cached cover color of an entity, if this session has already derived it.
export function getCachedCoverColor (entityId) {
  return coverColors.get(entityId)
}

// Returns the dominant color of an entity's cover image, or undefined when the image can't be read (e.g. no CORS).
export async function getCoverColor (entityId, url) {
  if (coverColors.has(entityId)) {
    return coverColors.get(entityId)
  }

  const image = await loadImage(url)

  if (!image) return

  const rgb = dominantRgb(image)

  if (rgb) {
    coverColors.set(entityId, rgb)
  }

  return rgb
}

// Loads an image with CORS so its pixels can be read; resolves undefined on failure.
function loadImage (url) {
  return new Promise((resolve) => {
    const image = new Image()

    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve()
    image.src = url
  })
}

// Buckets a downscaled copy of the image and returns the heaviest colorful bucket, skipping near-white, near-black and gray ones.
function dominantRgb (image) {
  const size = 32
  const canvas = document.createElement('canvas')

  canvas.width = size
  canvas.height = size

  let pixels

  try {
    const context = canvas.getContext('2d', { willReadFrequently: true })

    context.drawImage(image, 0, 0, size, size)
    pixels = context.getImageData(0, 0, size, size).data
  }
  catch {
    return
  }

  const buckets = new Map()

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue

    const key = (pixels[i] >> 6) * 16 + (pixels[i + 1] >> 6) * 4 + (pixels[i + 2] >> 6)
    const bucket = buckets.get(key) || { count: 0, red: 0, green: 0, blue: 0 }

    bucket.count++
    bucket.red += pixels[i]
    bucket.green += pixels[i + 1]
    bucket.blue += pixels[i + 2]
    buckets.set(key, bucket)
  }

  const total = [...buckets.values()].reduce((sum, x) => sum + x.count, 0)
  const colors = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .map((x) => ({
      share: x.count / total,
      red: x.red / x.count / 255,
      green: x.green / x.count / 255,
      blue: x.blue / x.count / 255
    }))

  if (colors.length === 0) return

  const { red, green, blue } = colors.find((x) => x.share >= 0.05 && isColorful(x)) || colors[0]

  return { red, green, blue }
}

// Saturated and not near-black — a color that can carry the entity's identity on the header.
function isColorful ({ red, green, blue }) {
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const saturation = max === 0 ? 0 : (max - min) / max

  return saturation >= 0.15 && max >= 0.15
}

// djb2 hash over UTF-8 bytes into a hue in 0..1, matching the native app's `derivedHue`.
function derivedHue (id) {
  let hash = 5381

  for (const byte of new TextEncoder().encode(id)) {
    hash = (Math.imul(hash, 33) + byte) >>> 0
  }

  return (hash % 360) / 360
}

// Converts HSV (all 0..1) to RGB components in 0..1.
function hsvToRgb (hue, saturation, value) {
  const sector = Math.floor(hue * 6)
  const fraction = hue * 6 - sector
  const p = value * (1 - saturation)
  const q = value * (1 - fraction * saturation)
  const t = value * (1 - (1 - fraction) * saturation)
  const [red, green, blue] = [
    [value, t, p],
    [q, value, p],
    [p, value, t],
    [p, q, value],
    [t, p, value],
    [value, p, q]
  ][sector % 6]

  return { red, green, blue }
}

// Formats RGB components in 0..1 as a CSS rgb() color.
function rgbToCss ({ red, green, blue }) {
  return `rgb(${Math.round(red * 255)} ${Math.round(green * 255)} ${Math.round(blue * 255)})`
}
