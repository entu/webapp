import et from 'date-fns/esm/locale/et'
import { enUS, createLocale } from 'naive-ui'

export const themeOverrides = {
  common: {
    fontFamily: 'Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px',
    primaryColor: '#1E434C'
  },
  Collapse: {
    dividerColor: '#FFFFFF'
  },
  DataTable: {
    tdColorHover: '#FFFFFF',
    thColor: '#FFFFFF',
    thColorHover: '#FFFFFF'
  },
  Drawer: {
    resizableTriggerColorHover: '#1E434C'
  },
  Input: {
    borderFocus: '1px solid #1E434C',
    borderHover: '1px solid #1E434C',
    boxShadowFocus: '0 0 0 2px rgba(3, 117, 255, 0.2)'
  },
  Layout: {
    siderColor: '#1E434C'
  },
  LoadingBar: {
    colorLoading: 'rgb(14, 165, 233)',
    height: '3px'
  },
  Menu: {
    arrowColor: 'rgba(255, 255, 255, 0.7)',
    arrowColorActive: '#FFFFFF',
    arrowColorActiveHover: '#FFFFFF',
    arrowColorChildActive: '#FFFFFF',
    arrowColorChildActiveHover: '#FFFFFF',
    arrowColorHover: 'rgba(255, 255, 255, 0.7)',

    dividerColor: 'rgba(255, 255, 255, .2)',

    itemColorActive: 'rgba(255, 255, 255, 0.15)',
    itemColorActiveCollapsed: 'rgba(255, 255, 255, 0.15)',
    itemColorActiveHover: 'rgba(255, 255, 255, 0.15)',
    itemColorHover: 'rgba(255, 255, 255, 0.15)',

    itemIconColor: 'rgba(255, 255, 255, 0.7)',
    itemIconColorActive: '#FFFFFF',
    itemIconColorActiveHover: '#FFFFFF',
    itemIconColorChildActive: '#FFFFFF',
    itemIconColorChildActiveHover: '#FFFFFF',
    itemIconColorCollapsed: 'rgba(255, 255, 255, 0.7)',
    itemIconColorCollapsedChildActive: '#FFFFFF',
    itemIconColorHover: 'rgba(255, 255, 255, 0.7)',

    itemTextColor: 'rgba(255, 255, 255, 0.7)',
    itemTextColorActive: '#FFFFFF',
    itemTextColorActiveHover: '#FFFFFF',
    itemTextColorChildActive: '#FFFFFF',
    itemTextColorChildActiveHover: 'rgba(255, 255, 255, .5)',
    itemTextColorHover: 'rgba(255, 255, 255, 0.7)'
  },
  Select: {
    menuBoxShadow: '0 0 0 1px rgb(3, 117, 255)',
    peers: {
      InternalSelection: {
        borderFocus: '1px solid #1E434C',
        borderHover: '1px solid #1E434C'
      }
    }
  },
  Slider: {
    dotBorder: '2px solid #1E434C',
    dotBorderActive: '2px solid #1E434C',
    fillColor: '#DBDBDF',
    fillColorHover: '#DBDBDF'
  }
}

// From https://github.com/tusen-ai/naive-ui/blob/main/src/locales/common/enUS.ts
export const etLocale = createLocale({
  name: 'et-EE',
  global: {
    undo: 'Tühista',
    redo: 'Tee uuesti',
    confirm: 'Kinnita',
    clear: 'Tühista'
  },
  Popconfirm: {
    positiveText: 'Kinnita',
    negativeText: 'Tühista'
  },
  Cascader: {
    placeholder: 'Palun valige',
    loading: 'Laadimine',
    loadingRequiredMessage: label => `Palun laadige kõik ${label} järglased enne selle kontrollimist.`
  },
  Time: {
    dateFormat: 'dd.MM.yyyy',
    dateTimeFormat: 'dd.MM.yyyy HH:mm:ss'
  },
  DatePicker: {
    yearFormat: 'yyyy',
    monthFormat: 'MMM',
    dayFormat: 'eeeeee',
    yearTypeFormat: 'yyyy',
    monthTypeFormat: 'yyyy-MM',
    dateFormat: 'dd.MM.yyyy',
    dateTimeFormat: 'dd.MM.yyyy HH:mm:ss',
    quarterFormat: 'yyyy-qqq',
    weekFormat: 'yyyy-w',
    clear: 'Tühista',
    now: 'Nüüd',
    confirm: 'Kinnita',
    selectTime: 'Valige aeg',
    selectDate: 'Valige kuupäev',
    datePlaceholder: 'Valige kuupäev',
    datetimePlaceholder: 'Valige kuupäev ja aeg',
    monthPlaceholder: 'Valige kuu',
    yearPlaceholder: 'Valige aasta',
    quarterPlaceholder: 'Valige kvartal',
    weekPlaceholder: 'Valige nädal',
    startDatePlaceholder: 'Alguskuupäev',
    endDatePlaceholder: 'Lõppkuupäev',
    startDatetimePlaceholder: 'Alguskuupäev ja aeg',
    endDatetimePlaceholder: 'Lõppkuupäev ja aeg',
    startMonthPlaceholder: 'Alguskuu',
    endMonthPlaceholder: 'Lõppkuu',
    monthBeforeYear: true,
    firstDayOfWeek: 6,
    today: 'Täna'
  },
  DataTable: {
    checkTableAll: 'Valige kõik',
    uncheckTableAll: 'Tühista valik',
    confirm: 'Kinnita',
    clear: 'Tühista'
  },
  LegacyTransfer: {
    sourceTitle: 'Allikas',
    targetTitle: 'Siht'
  },
  Transfer: {
    selectAll: 'Vali kõik',
    unselectAll: 'Tühista kõik valikud',
    clearAll: 'Tühista',
    total: num => `Kokku ${num}`,
    selected: num => `Valitud ${num}`
  },
  Empty: {
    description: 'Andmed puuduvad'
  },
  Select: {
    placeholder: 'Palun valige'
  },
  TimePicker: {
    placeholder: 'Valige aeg',
    positiveText: 'OK',
    negativeText: 'Tühista',
    now: 'Nüüd',
    clear: 'Tühista'
  },
  Pagination: {
    goto: 'Mine',
    selectionSuffix: 'leht'
  },
  DynamicTags: {
    add: 'Lisa'
  },
  Log: {
    loading: 'Laadimine'
  },
  Input: {
    placeholder: 'Palun sisestage'
  },
  InputNumber: {
    placeholder: 'Palun sisestage'
  },
  DynamicInput: {
    create: 'Loo'
  },
  ThemeEditor: {
    title: 'Teema redaktor',
    clearAllVars: 'Tühjenda kõik muutujad',
    clearSearch: 'Tühjenda otsing',
    filterCompName: 'Filtreeri komponendi nime järgi',
    filterVarName: 'Filtreeri muutuja nime järgi',
    import: 'Impordi',
    export: 'Ekspordi',
    restore: 'Lähtesta'
  },
  Image: {
    tipPrevious: 'Eelmine pilt (←)',
    tipNext: 'Järgmine pilt (→)',
    tipCounterclockwise: 'Vastupäeva',
    tipClockwise: 'Päripäeva',
    tipZoomOut: 'Vähenda',
    tipZoomIn: 'Suurenda',
    tipDownload: 'Laadi alla',
    tipClose: 'Sulge (Esc)',
    tipOriginalSize: 'Suurenda algmõõtmetesse'
  }
}, enUS)

export const etDateLocale = {
  name: 'et',
  locale: et
}

export function humanFileSize (bytes, si = true, dp = 2) {
  if (bytes === null) return

  const { n } = useI18n()
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) return bytes + ' B'

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
