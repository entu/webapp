const MAX_HISTORY_MESSAGES = 40
const MAX_MESSAGE_LENGTH = 8000

export const useChatStore = defineStore('chat', () => {
  const { accountId } = useAccount()

  const messages = ref([])
  const usage = ref({ total: 0, cached: 0 })
  const isOpen = ref(false)
  const isLoading = ref(false)
  const isExecuting = ref(false)

  const pendingMessage = computed(() => messages.value.findLast((x) => x.role === 'assistant' && x.proposal && !x.executionResults && !x.declined))

  function apiHistory () {
    return messages.value
      .filter((x) => !x.error && !x.local)
      .slice(-MAX_HISTORY_MESSAGES)
      .map((x) => ({ role: x.role, content: x.content.slice(0, MAX_MESSAGE_LENGTH) }))
  }

  function supersedePending () {
    if (!pendingMessage.value) return

    pendingMessage.value.declined = true
    messages.value.push({ role: 'user', content: '[User declined the proposed changes]', hidden: true })
  }

  async function send (content) {
    const trimmed = content?.trim()

    if (!trimmed || isLoading.value) return

    supersedePending()

    messages.value.push({ role: 'user', content: trimmed })

    const userMessage = messages.value.at(-1)

    isLoading.value = true

    try {
      const response = await apiAiChat(apiHistory())

      usage.value.total += response.usage?.total || 0
      usage.value.cached += response.usage?.cached || 0

      messages.value.push({
        role: 'assistant',
        content: response.message,
        proposal: response.proposal
      })
    }
    catch (error) {
      userMessage.error = error.data?.statusMessage || error.data?.message || error.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function confirm () {
    const message = pendingMessage.value

    if (!message || isExecuting.value) return

    isExecuting.value = true

    try {
      const { results, error } = await apiAiExecute(message.proposal.operations)

      message.executionResults = { results, error }

      if (results?.length) {
        useEntityTypeStore().clear()
        useMenuStore().get()
      }

      const note = error
        ? `[User confirmed the proposed changes; operations before index ${error.index} were executed, the operation at index ${error.index} failed (${error.statusMessage}), the rest were not attempted]`
        : '[User confirmed the proposed changes; all operations were executed]'

      messages.value.push({ role: 'user', content: note, hidden: true })

      messages.value.push({
        role: 'assistant',
        local: true,
        summary: {
          applied: results?.length || 0,
          total: message.proposal.operations.length,
          failed: !!error
        }
      })
    }
    catch (error) {
      message.error = error.data?.statusMessage || error.data?.message || error.message
    }
    finally {
      isExecuting.value = false
    }
  }

  function reject () {
    const message = pendingMessage.value

    if (!message) return

    message.declined = true
    messages.value.push({ role: 'user', content: '[User declined the proposed changes]', hidden: true })
  }

  function reset () {
    messages.value = []
    usage.value = { total: 0, cached: 0 }
    isLoading.value = false
    isExecuting.value = false
  }

  watch(accountId, (value, oldValue) => {
    if (value === oldValue) return

    reset()
    isOpen.value = false
  })

  return {
    messages,
    usage,
    isOpen,
    isLoading,
    isExecuting,
    send,
    confirm,
    reject,
    reset
  }
})
