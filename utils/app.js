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

export const etLocale = createLocale({
  name: 'en-US',
  global: {
    undo: 'Undo',
    redo: 'Redo',
    confirm: 'Confirm',
    clear: 'Clear'
  },
  Popconfirm: {
    positiveText: 'Confirm',
    negativeText: 'Cancel'
  },
  Cascader: {
    placeholder: 'Please Select',
    loading: 'Loading',
    loadingRequiredMessage: label => `Please load all ${label}'s descendants before checking it.`
  },
  Time: {
    dateFormat: 'yyyy-MM-dd',
    dateTimeFormat: 'yyyy-MM-dd HH:mm:ss'
  },
  DatePicker: {
    yearFormat: 'yyyy',
    monthFormat: 'MMM',
    dayFormat: 'eeeeee',
    yearTypeFormat: 'yyyy',
    monthTypeFormat: 'yyyy-MM',
    dateFormat: 'yyyy-MM-dd',
    dateTimeFormat: 'yyyy-MM-dd HH:mm:ss',
    quarterFormat: 'yyyy-qqq',
    weekFormat: 'yyyy-w',
    clear: 'Clear',
    now: 'Now',
    confirm: 'Confirm',
    selectTime: 'Select Time',
    selectDate: 'Select Date',
    datePlaceholder: 'Select Date',
    datetimePlaceholder: 'Select Date and Time',
    monthPlaceholder: 'Select Month',
    yearPlaceholder: 'Select Year',
    quarterPlaceholder: 'Select Quarter',
    weekPlaceholder: 'Select Week',
    startDatePlaceholder: 'Start Date',
    endDatePlaceholder: 'End Date',
    startDatetimePlaceholder: 'Start Date and Time',
    endDatetimePlaceholder: 'End Date and Time',
    startMonthPlaceholder: 'Start Month',
    endMonthPlaceholder: 'End Month',
    monthBeforeYear: true,
    firstDayOfWeek: 6,
    today: 'Today'
  },
  DataTable: {
    checkTableAll: 'Select all in the table',
    uncheckTableAll: 'Unselect all in the table',
    confirm: 'Confirm',
    clear: 'Clear'
  },
  LegacyTransfer: {
    sourceTitle: 'Source',
    targetTitle: 'Target'
  },
  Transfer: {
    selectAll: 'Select all',
    unselectAll: 'Unselect all',
    clearAll: 'Clear',
    total: () => `Total ${num} items`,
    selected: () => `${num} items selected`
  },
  Empty: {
    description: 'No Data'
  },
  Select: {
    placeholder: 'Please Select'
  },
  TimePicker: {
    placeholder: 'Select Time',
    positiveText: 'OK',
    negativeText: 'Cancel',
    now: 'Now',
    clear: 'Clear'
  },
  Pagination: {
    goto: 'Goto',
    selectionSuffix: 'page'
  },
  DynamicTags: {
    add: 'Add'
  },
  Log: {
    loading: 'Loading'
  },
  Input: {
    placeholder: 'Please Input'
  },
  InputNumber: {
    placeholder: 'Please Input'
  },
  DynamicInput: {
    create: 'Create'
  },
  ThemeEditor: {
    title: 'Theme Editor',
    clearAllVars: 'Clear All Variables',
    clearSearch: 'Clear Search',
    filterCompName: 'Filter Component Name',
    filterVarName: 'Filter Variable Name',
    import: 'Import',
    export: 'Export',
    restore: 'Reset to Default'
  },
  Image: {
    tipPrevious: 'Previous picture (←)',
    tipNext: 'Next picture (→)',
    tipCounterclockwise: 'Counterclockwise',
    tipClockwise: 'Clockwise',
    tipZoomOut: 'Zoom out',
    tipZoomIn: 'Zoom in',
    tipDownload: 'Download',
    tipClose: 'Close (Esc)',
    // TODO: translation
    tipOriginalSize: 'Zoom to original size'
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
