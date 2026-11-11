<script setup>
const props = defineProps({
  entityId: { type: String, required: true },
  values: { type: Array, default: () => [] }
})

const emit = defineEmits(['refresh'])

const { d, t } = useI18n()

const isUpdating = ref(false)

const grant = computed(() => props.values.find((x) => x.datetime && new Date(x.datetime).getTime() > Date.now()))

// Grants Entu support access for this many days from now, replacing a running grant
async function allow (days) {
  isUpdating.value = true

  try {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    const current = props.values.at(0)

    await apiUpsertEntity(props.entityId, [{ type: 'support_until', datetime: until, ...(current?._id ? { _id: current._id } : {}) }])

    useAnalytics('click_support_allow', { days })
    emit('refresh')
  }
  finally {
    isUpdating.value = false
  }
}

// Ends support access at once by removing every grant value
async function revoke () {
  isUpdating.value = true

  try {
    for (const value of props.values.filter((x) => x._id)) {
      await apiDeleteProperty(value._id)
    }

    useAnalytics('click_support_revoke')
    emit('refresh')
  }
  finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <section
    class="mt-10 rounded-lg border p-4"
    :aria-label="t('title')"
    :class="{
      'border-orange-500 dark:border-orange-400': grant,
      'border-slate-200 dark:border-slate-800': !grant,
    }"
  >
    <h2 class="font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
      {{ t('title') }}
    </h2>

    <p
      v-if="grant"
      class="pt-1 text-sm text-orange-600 dark:text-orange-400"
    >
      {{ t('activeUntil', { date: d(new Date(grant.datetime), 'datetime') }) }}
    </p>
    <p
      v-else
      class="pt-1 text-sm text-slate-600 dark:text-slate-300"
    >
      {{ t('description') }}
    </p>

    <div class="flex flex-wrap gap-2 pt-3">
      <my-button
        v-for="days in [1, 7, 30]"
        :key="days"
        :disabled="isUpdating"
        :label="t('allowDays', { days }, days)"
        @click="allow(days)"
      />
      <my-button
        v-if="grant"
        icon="close"
        :disabled="isUpdating"
        :label="t('revoke')"
        @click="revoke()"
      />
    </div>
  </section>
</template>

<i18n lang="yaml">
  en:
    title: Entu support access
    description: Let Entu support see and change all data in this database for a limited time, to help with a problem. Every change it makes is recorded.
    activeUntil: "Entu support can see and change all data until {date}. Every change it makes is recorded."
    allowDays: "Allow for {days} day | Allow for {days} days"
    revoke: End access now
  et:
    title: Entu kasutajatoe ligipääs
    description: Luba Entu kasutajatoel piiratud ajaks näha ja muuta kõiki selle andmebaasi andmeid, et aidata probleemi lahendada. Iga tehtud muudatus salvestatakse.
    activeUntil: "Entu kasutajatugi saab kõiki andmeid näha ja muuta kuni {date}. Iga tehtud muudatus salvestatakse."
    allowDays: "Luba {days} päevaks | Luba {days} päevaks"
    revoke: Lõpeta ligipääs kohe
</i18n>
