<script setup>
import { NInput, NInputGroup, NPopover } from 'naive-ui'

const { t } = useI18n()

const chatStore = useChatStore()
const { messages, isOpen, isLoading } = storeToRefs(chatStore)

const inputText = ref('')
const drawerWidth = ref(Math.min(600, window.innerWidth))
const messagesRef = useTemplateRef('messagesRef')
const inputRef = useTemplateRef('inputRef')

const visibleMessages = computed(() => messages.value.filter((x) => !x.hidden))

const canSend = computed(() => !isLoading.value && !!inputText.value.trim())

const examples = computed(() => [t('example1'), t('example2'), t('example3')])

async function send () {
  const content = inputText.value.trim()

  if (!content || isLoading.value) return

  inputText.value = ''
  await chatStore.send(content)
}

function sendExample (example) {
  chatStore.send(example)
}

function onKeydown (event) {
  if (event.key !== 'Enter') return

  event.preventDefault()
  send()
}

function scrollToBottom () {
  nextTick(() => {
    messagesRef.value?.scrollTo({ top: messagesRef.value.scrollHeight, behavior: 'smooth' })
  })
}

watch(() => visibleMessages.value.length, scrollToBottom)

watch(isLoading, (value) => {
  scrollToBottom()

  if (!value) {
    nextTick(() => inputRef.value?.focus())
  }
})

watch(isOpen, (value) => {
  if (!value) return

  useAnalytics('show_ai')
})
</script>

<template>
  <my-drawer
    v-model:show="isOpen"
    v-model:width="drawerWidth"
    :title="t('title')"
  >
    <div class="flex size-full flex-col">
      <div
        ref="messagesRef"
        class="grow overflow-y-auto px-3 py-4 md:px-6"
      >
        <div
          v-if="!visibleMessages.length"
          class="flex h-full flex-col items-center justify-center gap-4 text-gray-500"
        >
          <my-icon
            class="text-4xl"
            icon="sparkles"
          />

          <p class="text-center">
            {{ t('emptyHint') }}
          </p>

          <div class="flex flex-col items-center gap-2">
            <button
              v-for="example in examples"
              :key="example"
              class="cursor-pointer rounded-full border border-gray-300 px-4 py-1 text-sm hover:bg-gray-100"
              type="button"
              @click="sendExample(example)"
            >
              {{ example }}
            </button>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col gap-4"
        >
          <chat-message
            v-for="(message, index) in visibleMessages"
            :key="index"
            :message="message"
          />

          <div
            v-if="isLoading"
            class="flex items-center gap-2 text-gray-500"
          >
            <my-icon
              class="animate-pulse"
              icon="sparkles"
            />

            {{ t('thinking') }}
          </div>
        </div>
      </div>

      <div class="shrink-0 p-3">
        <n-input-group>
          <n-input
            ref="inputRef"
            v-model:value="inputText"
            round
            :disabled="isLoading"
            :placeholder="t('placeholder')"
            @keydown="onKeydown"
          >
            <template #suffix>
              <n-popover>
                <template #trigger>
                  <my-icon
                    icon="arrow-up"
                    :class="{
                      'cursor-pointer': canSend,
                      'text-gray-300': !canSend,
                    }"
                    @click="send()"
                  />
                </template>
                <div class="text-sm">
                  {{ t('send') }}
                </div>
              </n-popover>
            </template>
          </n-input>
        </n-input-group>
      </div>
    </div>

    <template #footer>
      <my-button
        v-if="visibleMessages.length"
        icon="add"
        :bg="false"
        :label="t('newChat')"
        @click="chatStore.reset()"
      />
    </template>
  </my-drawer>
</template>

<i18n lang="yaml">
  en:
    title: Entu AI
    placeholder: Ask Entu AI...
    send: Send
    thinking: Thinking...
    newChat: New chat
    emptyHint: Entu AI can answer questions about your data and propose changes. Nothing is changed without your confirmation.
    example1: What entity types do I have?
    example2: Add a new entity
    example3: Find entities changed this week
  et:
    title: Entu AI
    placeholder: Küsi Entu AI-lt...
    send: Saada
    thinking: Mõtlen...
    newChat: Uus vestlus
    emptyHint: Entu AI oskab vastata küsimustele sinu andmete kohta ja pakkuda välja muudatusi. Midagi ei muudeta ilma sinu kinnituseta.
    example1: Millised objektitüübid mul on?
    example2: Lisa uus objekt
    example3: Leia sel nädalal muudetud objektid
</i18n>
