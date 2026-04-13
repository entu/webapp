export function useAnalytics (event, data) {
  window.analytics.track(event, { ...data })
}
