<script setup>
import { NIcon, NButton, NTooltip } from 'naive-ui'
import { Add as AddIcon, TreeViewAlt as TreeViewAltIcon, Copy as CopyIcon, Edit as EditIcon, UserMultiple as UserMultipleIcon } from '@vicons/carbon'

defineProps({
  right: { type: String, default: null }
})

const { t } = useI18n()
</script>

<template>
  <div class="h-12 mx-2 flex items-center justify-end border-b border-gray-300">
    {{ right }}
    <n-tooltip
      v-if="['owner', 'editor', 'expander'].includes(right)"
      trigger="hover"
    >
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <n-icon size="28">
              <add-icon />
            </n-icon>
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
            <n-icon size="20">
              <edit-icon />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ t('edit') }}
    </n-tooltip>

    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <n-icon size="20">
              <copy-icon />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ t('duplicate') }}
    </n-tooltip>

    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <n-icon size="20">
              <tree-view-alt-icon />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ t('parents') }}
    </n-tooltip>

    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <n-icon size="20">
              <user-multiple-icon />
            </n-icon>
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
