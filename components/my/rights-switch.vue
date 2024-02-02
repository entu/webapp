<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButtonGroup } from 'naive-ui'

const { t } = useI18n()

const emit = defineEmits(['update:value'])

const value = defineModel({ type: String, default: undefined })

defineProps({
  disabled: { type: Boolean, default: false },
  deletable: { type: Boolean, default: false },
  label: { type: String, required: true },
  to: { type: Object, required: true }
})

const rights = ref([
  'viewer',
  'expander',
  'editor',
  'owner'
])
</script>

<template>
  <div class="mb-4 flex items-center justify-between gap-2">
    <nuxt-link
      class="link truncate whitespace-nowrap overflow-hidden"
      :to="to"
    >
      {{ label }}
    </nuxt-link>

    <n-button-group>
      <my-button
        v-if="deletable"
        icon="rights/none"
        :disabled="disabled"
        :tooltip="t('none')"
        @click="value = undefined; emit('update:value', undefined)"
      />

      <my-button
        v-for="r in rights"
        :key="r"
        :class="{ '!bg-blue-400 !text-white': value === r }"
        :disabled="disabled"
        :icon="`rights/${r}`"
        :tooltip="t(r)"
        @click="value = r; emit('update:value', r)"
      />
    </n-button-group>
  </div>
</template>

<i18n lang="yaml">
  en:
    none: User has no access to this entity
    viewer: User can see this entity
    expander: User can add children to this entity
    editor: User can edit this entity and add children to it
    owner: User can edit, delete, add children and change rights
  et:
    none: Kasutajal puudub ligipääs objektile
    viewer: Kasutaja näeb seda objekti
    expander: Kasutaja saab sellele objektile lisada alamobjekte
    editor: Kasutaja saab objekti muuta ja lisada sellele alamosi
    owner: Kasutaja saab objekti muuta, kustutada, lisada sellele alamosi ja muuta õigusi
</i18n>
