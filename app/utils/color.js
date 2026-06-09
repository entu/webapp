// Full Tailwind background classes are listed as literals so the Tailwind
// scanner detects and generates them (dynamically built class strings would be
// purged). Keyed by shade token so call sites can pick the shade they need.
const COLOR_PALETTES = {
  '200!': ['bg-amber-200!', 'bg-blue-200!', 'bg-cyan-200!', 'bg-emerald-200!', 'bg-fuchsia-200!', 'bg-gray-200!', 'bg-green-200!', 'bg-indigo-200!', 'bg-lime-200!', 'bg-neutral-200!', 'bg-orange-200!', 'bg-pink-200!', 'bg-purple-200!', 'bg-red-200!', 'bg-rose-200!', 'bg-sky-200!', 'bg-slate-200!', 'bg-stone-200!', 'bg-teal-200!', 'bg-violet-200!', 'bg-yellow-200!', 'bg-zinc-200!'],
  50: ['bg-amber-50', 'bg-blue-50', 'bg-cyan-50', 'bg-emerald-50', 'bg-fuchsia-50', 'bg-gray-50', 'bg-green-50', 'bg-indigo-50', 'bg-lime-50', 'bg-neutral-50', 'bg-orange-50', 'bg-pink-50', 'bg-purple-50', 'bg-red-50', 'bg-rose-50', 'bg-sky-50', 'bg-slate-50', 'bg-stone-50', 'bg-teal-50', 'bg-violet-50', 'bg-yellow-50', 'bg-zinc-50']
}

// Returns a random Tailwind background class for the given shade token
// (e.g. `200!` or `50`).
export function randomColor (shade = '200!') {
  const palette = COLOR_PALETTES[shade] || COLOR_PALETTES['200!']

  return palette[Math.floor(Math.random() * palette.length)]
}
