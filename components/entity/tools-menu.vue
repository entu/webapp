<script setup>
import { NButton, NTooltip } from 'naive-ui'

defineProps({
  right: { type: String, default: null }
})

const { t } = useI18n()
</script>

<template>
  <div class="h-12 mx-2 flex items-center justify-end border-b border-gray-300">
    <n-tooltip
      v-if="['owner', 'editor', 'expander'].includes(right)"
      trigger="hover"
    >
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <nuxt-icon
              class="text-2xl"
              name="ionicons5/Add"
            />
          </template>
        </n-button>
      </template>
      {{ t('add') }}
    </n-tooltip>

    <n-tooltip
      v-if="['owner', 'editor'].includes(right)"
      trigger="hover"
    >
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <nuxt-icon name="carbon/Edit" />
          </template>
        </n-button>
      </template>
      {{ t('edit') }}
    </n-tooltip>

    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <nuxt-icon name="carbon/Copy" />
          </template>
        </n-button>
      </template>
      {{ t('duplicate') }}
    </n-tooltip>

    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <nuxt-icon name="carbon/TreeViewAlt" />
          </template>
        </n-button>
      </template>
      {{ t('parents') }}
    </n-tooltip>

    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <nuxt-icon name="carbon/UserMultiple" />
          </template>
        </n-button>
      </template>
      {{ t('rights') }}
    </n-tooltip>
  </div>
</template>

<i18n lang="yaml">
  en:
    add: Add
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: User rights
  et:
    add: Lisa
    edit: Muuda
    duplicate: Dubleeri
    parents: Peamised
    rights: Õigused
</i18n>
