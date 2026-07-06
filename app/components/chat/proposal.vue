<script setup>
import DOMPurify from 'dompurify'
import { stringify } from 'yaml'
import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/github.css'

const { t } = useI18n()

hljs.registerLanguage('yaml', yaml)

function showYaml (value) {
  return DOMPurify.sanitize(hljs.highlight(stringify(value), { language: 'yaml' }).value)
}

const chatStore = useChatStore()
const { isExecuting } = storeToRefs(chatStore)
const { accountId } = useAccount()

const props = defineProps({
  proposal: { type: Object, required: true },
  results: { type: Object, default: undefined },
  status: { type: String, default: 'pending' }
})

function opEntityId (index) {
  return props.results?.results?.at(index)?._id
}

function opIcon (op) {
  const name = op?.toLowerCase() || ''

  if (name.includes('delete')) return 'delete'
  if (name.includes('add') || name.includes('create')) return 'add'
  if (name.includes('edit') || name.includes('update') || name.includes('set')) return 'edit'

  return 'data'
}

function opStatus (index) {
  if (props.status !== 'executed') return

  const error = props.results?.error

  if (!error) return 'applied'
  if (index < error.index) return 'applied'
  if (index === error.index) return 'failed'

  return 'skipped'
}
</script>

<template>
  <div
    class="rounded-lg border border-gray-200 bg-gray-50 p-3"
    :class="{ 'opacity-60': status === 'declined' }"
  >
    <div class="mb-2 flex items-center justify-between gap-2 text-sm font-bold text-gray-500 uppercase">
      {{ t('proposedChanges') }}

      <span
        v-if="status === 'declined'"
        class="font-normal normal-case"
      >
        {{ t('declined') }}
      </span>
    </div>

    <div class="flex flex-col gap-2">
      <div
        v-for="(operation, index) in proposal.operations"
        :key="operation.tempId || index"
        class="rounded-md bg-white p-2"
      >
        <div class="flex items-start gap-2">
          <my-icon
            class="mt-0.5 shrink-0 text-gray-500"
            :icon="opIcon(operation.op)"
          />

          <div class="min-w-0 grow">
            <div class="text-sm">
              {{ operation.description }}
            </div>

            <details class="mt-1">
              <summary class="cursor-pointer text-xs text-gray-400 select-none">
                {{ t('details') }}
              </summary>

              <div
                v-html="showYaml(operation.properties || operation.params)"
                class="mt-1 overflow-x-auto rounded-md bg-slate-50 p-2 font-mono text-xs whitespace-pre"
              />
            </details>

            <nuxt-link
              v-if="opStatus(index) === 'applied' && opEntityId(index)"
              class="mt-1 inline-block text-sm underline"
              :to="{ path: `/${accountId}/${opEntityId(index)}` }"
            >
              {{ t('open') }}
            </nuxt-link>
          </div>

          <div
            v-if="opStatus(index) === 'applied'"
            class="flex shrink-0 items-center gap-1 text-sm text-green-600"
          >
            <my-icon icon="checkmark" />

            {{ t('applied') }}
          </div>

          <div
            v-else-if="opStatus(index) === 'failed'"
            class="flex shrink-0 items-center gap-1 text-sm text-red-600"
          >
            <my-icon icon="close" />

            {{ t('failed') }}
          </div>

          <div
            v-else-if="opStatus(index) === 'skipped'"
            class="shrink-0 text-sm text-gray-400"
          >
            {{ t('skipped') }}
          </div>
        </div>

        <div
          v-if="opStatus(index) === 'failed' && results?.error?.statusMessage"
          class="mt-1 text-sm text-red-600"
        >
          {{ results.error.statusMessage }}
        </div>
      </div>
    </div>

    <div
      v-if="status === 'pending'"
      class="mt-3 flex justify-end gap-2"
    >
      <my-button
        :bg="false"
        :disabled="isExecuting"
        :label="t('cancel')"
        @click="chatStore.reject()"
      />

      <my-button
        type="primary"
        :disabled="isExecuting"
        :label="t('apply')"
        :loading="isExecuting"
        @click="chatStore.confirm()"
      />
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    proposedChanges: Proposed changes
    details: Details
    apply: Apply changes
    cancel: Cancel
    applied: Applied
    failed: Failed
    skipped: Skipped
    declined: Declined
    open: Open
  et:
    proposedChanges: Pakutud muudatused
    details: Üksikasjad
    apply: Rakenda muudatused
    cancel: Loobu
    applied: Tehtud
    failed: Ebaõnnestus
    skipped: Vahele jäetud
    declined: Tagasi lükatud
    open: Ava
</i18n>
