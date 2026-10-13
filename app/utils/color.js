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

// Dominant cover colors (#rrggbb) per entity id from the thumbnail API, so a revisited entity paints its header at once.
const coverColors = new Map()

// Remembers an entity's cover color from a thumbnail response for this session.
export function setCoverColor (entityId, color) {
  if (entityId && color) {
    coverColors.set(entityId, color)
  }
}

// Returns an entity's cover color, if a thumbnail response has given it this session.
export function getCoverColor (entityId) {
  return coverColors.get(entityId)
}

// Returns the solid color derived from an id, like the native app's `Color.derived`.
export function derivedColor (id = '') {
  return rgbToCss(hsvToRgb(derivedHue(id), 0.62, 0.72))
}

// Returns a CSS gradient of the hue derived from an id — the same hash and stops as the native app's `derivedGradient`, run horizontally so the toolbar strip and header band join seamlessly.
export function derivedGradient (id = '') {
  const hue = derivedHue(id)
  const from = hsvToRgb(hue, 0.68, 0.62)
  const to = hsvToRgb((hue + 0.06) % 1, 0.56, 0.84)

  return `linear-gradient(to right, ${rgbToCss(from)}, ${rgbToCss(to)})`
}

// Returns a CSS gradient for a #rrggbb cover color, darkened toward the leading stop like the native app's `coverHeaderGradient`, run horizontally.
export function coverGradient (color) {
  const value = Number.parseInt(color.slice(1), 16)
  const red = (value >> 16 & 255) / 255
  const green = (value >> 8 & 255) / 255
  const blue = (value & 255) / 255
  const from = { red: red * 0.55, green: green * 0.55, blue: blue * 0.55 }
  const to = { red: Math.min(red * 1.2, 1), green: Math.min(green * 1.2, 1), blue: Math.min(blue * 1.2, 1) }

  return `linear-gradient(to right, ${rgbToCss(from)}, ${rgbToCss(to)})`
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
