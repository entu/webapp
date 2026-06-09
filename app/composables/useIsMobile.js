// Reactive mobile-viewport flag. Single source of truth for the breakpoint
// below which the UI switches to its mobile layout.
export const MOBILE_BREAKPOINT = 768

export function useIsMobile () {
  const { width } = useWindowSize()

  const isMobile = computed(() => width.value < MOBILE_BREAKPOINT)

  return { isMobile }
}
