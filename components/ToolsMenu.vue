<script setup>
import { NIcon, NButton, NTooltip } from 'naive-ui'
import { Add as AddIcon, TreeViewAlt as TreeViewAltIcon, Copy as CopyIcon, Edit as EditIcon, UserMultiple as UserMultipleIcon } from '@vicons/carbon'

</script>

<template>
  <div class="h-12 mx-2 flex items-center justify-end border-b border-gray-300">
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <n-icon size="28">
              <add-icon />
            </n-icon>
          </template>
        </n-button>
      </template>
      Add
    </n-tooltip>

    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <n-icon size="20">
              <edit-icon />
            </n-icon>
          </template>
        </n-button>
      </template>
      Edit
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
      Duplicate
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
      Parents
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
      User rights
    </n-tooltip>
  </div>
</template>
