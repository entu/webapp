<script setup>
const { t } = useI18n()

const props = defineProps({
  message: { type: Object, required: true }
})

const summaryText = computed(() => {
  const summary = props.message.summary

  if (!summary) return

  if (!summary.failed) return t('appliedAll')

  return t('appliedSome', { applied: summary.applied, total: summary.total })
})

const proposalStatus = computed(() => {
  if (props.message.declined) return 'declined'
  if (props.message.executionResults) return 'executed'

  return 'pending'
})
</script>

<template>
  <div
    class="flex flex-col"
    :class="{ 'items-end': message.role === 'user' }"
  >
    <div
      v-if="message.role === 'user'"
      class="max-w-[85%] rounded-2xl rounded-br-sm bg-[#1E434C] px-4 py-2 whitespace-pre-wrap text-white"
    >
      {{ message.content }}
    </div>

    <div
      v-else
      class="max-w-full"
    >
      <div v-if="summaryText">
        {{ summaryText }}
      </div>

      <my-markdown
        v-else
        new-tab
        :source="message.content"
      />

      <chat-proposal
        v-if="message.proposal"
        class="mt-3"
        :proposal="message.proposal"
        :results="message.executionResults"
        :status="proposalStatus"
      />
    </div>

    <div
      v-if="message.error"
      class="mt-2 max-w-full self-start whitespace-pre-wrap text-red-600"
    >
      {{ message.error }}
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    appliedAll: All changes are applied.
    appliedSome: '{applied} of {total} changes were applied, the rest failed or were skipped.'
  et:
    appliedAll: Kõik muudatused on tehtud.
    appliedSome: '{applied} muudatust {total}-st sai tehtud, ülejäänud ebaõnnestusid või jäid vahele.'
</i18n>

