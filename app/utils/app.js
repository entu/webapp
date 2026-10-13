// Brand colour triad — the JS source of truth for the Naive UI theme.
// Keep in sync with the `--color-brand*` tokens in app/assets/tailwind.css
// and the native app's asset catalog (EntuBrand / AccentColor colorsets).
export const brandColor = '#1E434C'
export const brandColorHover = '#162E35'
export const brandColorPressed = '#0F2027'

// Light and dark palettes for the Naive UI theme: page surface, brand, the side menu glass with its text, and the focus ring (blue-900 / blue-300) — keep in sync with app/assets/tailwind.css.
const lightPalette = {
  surface: '#FFFFFF',
  panel: '#FFFFFF',
  brand: brandColor,
  brandHover: brandColorHover,
  brandPressed: brandColorPressed,
  menu: 'rgba(226, 232, 240, 0.65)',
  menuHover: 'rgba(15, 23, 43, 0.06)',
  menuDivider: 'rgba(0, 0, 0, 0.1)',
  menuText: '#45556C',
  menuTextActive: '#0F172B',
  focus: '#1C398E'
}

const darkPalette = {
  surface: '#020618',
  panel: '#0F172B',
  brand: '#3B7180',
  brandHover: '#4A8A99',
  brandPressed: '#2E5C68',
  menu: 'rgba(29, 41, 61, 0.65)',
  menuHover: 'rgba(255, 255, 255, 0.06)',
  menuDivider: 'rgba(255, 255, 255, 0.1)',
  menuText: '#CAD5E2',
  menuTextActive: '#F1F5F9',
  focus: '#8EC5FF'
}

// Dashboard stat colours as Tailwind color variables, so they follow dark mode; deleted amounts show at 30%.
export const statColors = {
  entities: { color: 'var(--color-cyan-600)', deletedColor: 'color-mix(in srgb, var(--color-cyan-600) 30%, transparent)' },
  properties: { color: 'var(--color-amber-400)', deletedColor: 'color-mix(in srgb, var(--color-amber-400) 30%, transparent)' },
  files: { color: 'var(--color-green-600)', deletedColor: 'color-mix(in srgb, var(--color-green-600) 30%, transparent)' },
  tokens: { color: 'var(--color-slate-400)', deletedColor: 'color-mix(in srgb, var(--color-slate-400) 30%, transparent)' }
}

export const themeOverrides = createThemeOverrides(lightPalette)
export const darkThemeOverrides = createThemeOverrides(darkPalette)

// Builds the Naive UI theme overrides from a palette, so light and dark mode share one structure.
function createThemeOverrides (palette) {
  return {
    common: {
      fontFamily: 'Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '16px',
      primaryColor: palette.brand,
      primaryColorHover: palette.brandHover,
      primaryColorPressed: palette.brandPressed,
      bodyColor: palette.surface,
      cardColor: palette.panel,
      modalColor: palette.panel,
      popoverColor: palette.panel
    },
    Collapse: {
      dividerColor: palette.surface
    },
    Drawer: {
      borderRadius: '0',
      color: palette.surface,
      resizableTriggerColorHover: palette.brand
    },
    Input: {
      borderFocus: `1px solid ${palette.brand}`,
      borderHover: `1px solid ${palette.brand}`,
      boxShadowFocus: `0 0 0 2px color-mix(in srgb, ${palette.focus} 20%, transparent)`
    },
    Layout: {
      color: palette.surface,
      siderColor: palette.menu
    },
    Menu: {
      arrowColor: palette.menuText,
      arrowColorActive: palette.menuTextActive,
      arrowColorActiveHover: palette.menuTextActive,
      arrowColorChildActive: palette.menuTextActive,
      arrowColorChildActiveHover: palette.menuTextActive,
      arrowColorHover: palette.menuTextActive,

      dividerColor: palette.menuDivider,

      itemColorActive: palette.menuHover,
      itemColorActiveCollapsed: palette.menuHover,
      itemColorActiveHover: palette.menuHover,
      itemColorHover: palette.menuHover,

      itemIconColor: palette.menuText,
      itemIconColorActive: palette.menuTextActive,
      itemIconColorActiveHover: palette.menuTextActive,
      itemIconColorChildActive: palette.menuTextActive,
      itemIconColorChildActiveHover: palette.menuTextActive,
      itemIconColorCollapsed: palette.menuText,
      itemIconColorCollapsedChildActive: palette.menuTextActive,
      itemIconColorHover: palette.menuTextActive,

      itemTextColor: palette.menuText,
      itemTextColorActive: palette.menuTextActive,
      itemTextColorActiveHover: palette.menuTextActive,
      itemTextColorChildActive: palette.menuTextActive,
      itemTextColorChildActiveHover: palette.menuTextActive,
      itemTextColorHover: palette.menuTextActive
    },
    Select: {
      menuBoxShadow: `0 0 0 1px ${palette.focus}`,
      peers: {
        InternalSelection: {
          borderFocus: `1px solid ${palette.brand}`,
          borderHover: `1px solid ${palette.brand}`
        }
      }
    },
    Tabs: {
      tabBorderRadius: '0'
    }
  }
}

export function humanFileSize (n, bytes, si = true, dp = 2) {
  if (bytes === null) return

  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return n(Math.round(bytes * 10) / 10) + ' ' + units[u]
}

const PREVIEWABLE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'avif', 'heic', 'heif', 'pdf'])

// Whether the API can make a thumbnail of a file value (images and PDFs), by its type or else its extension.
export function isPreviewableFile (value) {
  if (value?.filetype) {
    return value.filetype.startsWith('image/') || value.filetype === 'application/pdf'
  }

  return PREVIEWABLE_EXTENSIONS.has(value?.filename?.split('.').pop()?.toLowerCase())
}

export function cloneData (data) {
  return JSON.parse(JSON.stringify(data))
}

// Substitutes the {DATABASE} and {LOCALE} placeholders in a configured menu link.
export function linkReplace (url, accountId, locale) {
  return url.replace('{DATABASE}', accountId).replace('{LOCALE}', locale)
}
