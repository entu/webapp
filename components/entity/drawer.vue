<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NDrawer, NDrawerContent } from 'naive-ui'

const props = defineProps({
  addTypeId: { type: String, default: null },
  type: { type: String, default: null },
  entityId: { type: String, default: null }
})

const emit = defineEmits(['open', 'close'])

const drawerTitle = ref('')
const drawerWidth = ref(window.innerWidth / 2)

const drawer = computed({
  get: () => !!props.type,
  set: (value) => { value ? emit('open') : emit('close') }
})
</script>

<template>
  <n-drawer
    v-model:show="drawer"
    placement="right"
    resizable
    :default-width="drawerWidth"
    @update:show="(show) => { !show && emit('close') }"
  >
    <n-drawer-content
      :closable="true"
      :title="drawerTitle"
    >
      <drawer-add
        v-if="type === 'add'"
        :entity-id="entityId"
        :type-id="addTypeId"
        @update:title="(title) => { drawerTitle = title }"
      />
      <drawer-edit
        v-if="type === 'edit'"
        :entity-id="entityId"
        @update:title="(title) => { drawerTitle = title }"
      />
      <drawer-duplicate
        v-if="type === 'duplicate'"
        :entity-id="entityId"
        @update:title="(title) => { drawerTitle = title }"
      />
      <drawer-parents
        v-if="type === 'parents'"
        :entity-id="entityId"
        @update:title="(title) => { drawerTitle = title }"
      />
      <drawer-rights
        v-if="type === 'rights'"
        :entity-id="entityId"
        @update:title="(title) => { drawerTitle = title }"
      />
    </n-drawer-content>
  </n-drawer>
</template>
