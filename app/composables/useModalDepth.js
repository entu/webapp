// Reports a modal's show-state to the palette store so ⌘K can't open behind it.
export function useModalDepth (show) {
  const paletteStore = usePaletteStore()

  watch(show, (value, oldValue) => {
    if (value) {
      paletteStore.modalOpened()
    }
    else if (oldValue) {
      paletteStore.modalClosed()
    }
  }, { immediate: true })

  onUnmounted(() => {
    if (show.value) {
      paletteStore.modalClosed()
    }
  })
}
