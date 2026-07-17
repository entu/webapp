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
