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
  'noaccess',
  'viewer',
  'expander',
  'editor',
  'owner'
])
</script>

<template>
  <div class="mb-4 flex items-center justify-between gap-2">
    <div class="grow overflow-hidden truncate whitespace-nowrap">
      <nuxt-link
        class="link"
        :to="to"
      >
        {{ label }}
      </nuxt-link>
    </div>

    <my-button
      v-if="deletable"
      circle
      icon="delete"
      type="error"
      :bg="false"
      :disabled="disabled"
      :tooltip="t('delete')"
      @click="value = undefined; emit('update:value', undefined)"
    />

    <n-button-group>
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
    noaccess: User has no access to this entity
    viewer: User can see this entity
    expander: User can add children to this entity
    editor: User can edit this entity and add children to it
    owner: User can edit, delete, add children and change rights
    delete: Delete right
  et:
    noaccess: Kasutajal puudub ligipääs objektile
    viewer: Kasutaja näeb seda objekti
    expander: Kasutaja saab sellele objektile lisada alamobjekte
    editor: Kasutaja saab objekti muuta ja lisada sellele alamosi
    owner: Kasutaja saab objekti muuta, kustutada, lisada sellele alamosi ja muuta õigusi
    delete: Kustuta õigus
</i18n>
