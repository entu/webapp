// Brand colour triad — the JS source of truth for the Naive UI theme.
// Keep in sync with the `--color-brand*` tokens in app/assets/tailwind.css
// and the native app's asset catalog (EntuBrand / AccentColor colorsets).
export const brandColor = '#1E434C'
export const brandColorHover = '#162E35'
export const brandColorPressed = '#0F2027'

// Side menu glass (Tailwind slate-100 at 65%, blurred in the layout; a 6% slate-900 tint on hover and active, so it suits whatever glows through) and its dark text (slate-600, slate-900 on hover and active) — keep in sync with `--color-menu` in app/assets/tailwind.css.
export const menuColor = 'rgba(241, 245, 249, 0.65)'
const menuColorHover = 'rgba(15, 23, 43, 0.06)'
const menuTextColor = '#45556C'
const menuTextColorActive = '#0F172B'

// Dashboard stat colours — mirrored exactly in the native app's
// DashboardView stat colour extension.
export const statColors = {
  entities: { color: 'rgb(23,162,184)', deletedColor: 'rgba(23,162,184,.3)' },
  properties: { color: 'rgb(255,193,7)', deletedColor: 'rgba(255,193,7,.3)' },
  files: { color: 'rgb(40,167,69)', deletedColor: 'rgba(40,167,69,.3)' },
  tokens: { color: 'rgb(108,117,125)', deletedColor: 'rgba(108,117,125,.3)' }
}

export const themeOverrides = {
  common: {
    fontFamily: 'Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px',
    primaryColor: brandColor,
    primaryColorHover: brandColorHover,
    primaryColorPressed: brandColorPressed
  },
  Collapse: {
    dividerColor: '#FFFFFF'
  },
  Drawer: {
    borderRadius: '0',
    resizableTriggerColorHover: brandColor
  },
  Input: {
    borderFocus: `1px solid ${brandColor}`,
    borderHover: `1px solid ${brandColor}`,
    boxShadowFocus: '0 0 0 2px rgba(3, 117, 255, 0.2)'
  },
  Layout: {
    siderColor: menuColor
  },
  Menu: {
    arrowColor: menuTextColor,
    arrowColorActive: menuTextColorActive,
    arrowColorActiveHover: menuTextColorActive,
    arrowColorChildActive: menuTextColorActive,
    arrowColorChildActiveHover: menuTextColorActive,
    arrowColorHover: menuTextColorActive,

    dividerColor: 'rgba(0, 0, 0, 0.1)',

    itemColorActive: menuColorHover,
    itemColorActiveCollapsed: menuColorHover,
    itemColorActiveHover: menuColorHover,
    itemColorHover: menuColorHover,

    itemIconColor: menuTextColor,
    itemIconColorActive: menuTextColorActive,
    itemIconColorActiveHover: menuTextColorActive,
    itemIconColorChildActive: menuTextColorActive,
    itemIconColorChildActiveHover: menuTextColorActive,
    itemIconColorCollapsed: menuTextColor,
    itemIconColorCollapsedChildActive: menuTextColorActive,
    itemIconColorHover: menuTextColorActive,

    itemTextColor: menuTextColor,
    itemTextColorActive: menuTextColorActive,
    itemTextColorActiveHover: menuTextColorActive,
    itemTextColorChildActive: menuTextColorActive,
    itemTextColorChildActiveHover: menuTextColorActive,
    itemTextColorHover: menuTextColorActive
  },
  Select: {
    menuBoxShadow: '0 0 0 1px rgb(3, 117, 255)',
    peers: {
      InternalSelection: {
        borderFocus: `1px solid ${brandColor}`,
        borderHover: `1px solid ${brandColor}`
      }
    }
  },
  Tabs: {
    tabBorderRadius: '0'
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

export function cloneData (data) {
  return JSON.parse(JSON.stringify(data))
}

// Substitutes the {DATABASE} and {LOCALE} placeholders in a configured menu link.
export function linkReplace (url, accountId, locale) {
  return url.replace('{DATABASE}', accountId).replace('{LOCALE}', locale)
}
