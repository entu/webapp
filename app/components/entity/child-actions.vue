<script setup>
import { NButtonGroup, NDropdown } from 'naive-ui'
import { MyIcon } from '#components'

const props = defineProps({
  entityId: { type: String, required: true },
  owner: { type: Array, default: () => [] },
  editor: { type: Array, default: () => [] }
})

const emit = defineEmits(['refresh'])

const { t } = useI18n()
const { userId } = useUser()
const { width: windowWidth } = useWindowSize()
const isMobile = computed(() => windowWidth.value < 768)

const isOwner = computed(() => props.owner?.some((x) => x.reference === userId.value) || false)
const isEditor = computed(() => props.owner?.some((x) => x.reference === userId.value) || props.editor?.some((x) => x.reference === userId.value) || false)

const showEditDrawer = ref(false)
const showDuplicateDrawer = ref(false)
const showParentsDrawer = ref(false)
const showRightsDrawer = ref(false)

function onDrawerClose () {
  showEditDrawer.value = false
  showDuplicateDrawer.value = false
  showParentsDrawer.value = false
  showRightsDrawer.value = false
  emit('refresh')
}

function dropdownOptions () {
  const options = []

  if (isEditor.value) {
    options.push({ label: t('edit'), key: 'edit', icon: () => h(MyIcon, { icon: 'edit' }) })
  }
  if (isOwner.value) {
    options.push({ label: t('duplicate'), key: 'duplicate', icon: () => h(MyIcon, { icon: 'copy' }) })
  }
  if (isEditor.value) {
    options.push({ label: t('parents'), key: 'parents', icon: () => h(MyIcon, { icon: 'tree-view' }) })
  }
  if (isOwner.value) {
    options.push({ label: t('rights'), key: 'rights', icon: () => h(MyIcon, { icon: 'sharing-private' }) })
  }
  return options
}

function onDropdownSelect (key) {
  if (key === 'edit') {
    showEditDrawer.value = true
  }
  else if (key === 'duplicate') {
    showDuplicateDrawer.value = true
  }
  else if (key === 'parents') {
    showParentsDrawer.value = true
  }
  else if (key === 'rights') {
    showRightsDrawer.value = true
  }
}
</script>

<template>
  <div class="flex items-center gap-1">
    <template v-if="!isMobile">
      <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <n-button-group>
          <my-button
            v-if="isEditor"
            icon="edit"
            size="small"
            :title="t('edit')"
            @click.stop="showEditDrawer = true"
          />

          <my-button
            v-if="isOwner"
            icon="copy"
            size="small"
            :title="t('duplicate')"
            @click.stop="showDuplicateDrawer = true"
          />

          <my-button
            v-if="isEditor"
            icon="tree-view"
            size="small"
            :title="t('parents')"
            @click.stop="showParentsDrawer = true"
          />

          <my-button
            v-if="isOwner"
            icon="sharing-private"
            size="small"
            :title="t('rights')"
            @click.stop="showRightsDrawer = true"
          />
        </n-button-group>
      </div>
    </template>

    <template v-else>
      <n-dropdown
        :options="dropdownOptions()"
        @select="onDropdownSelect($event)"
      >
        <my-button
          circle
          icon="more"
          size="small"
          @click.stop
        />
      </n-dropdown>
    </template>

    <entity-drawer-edit
      v-model:show="showEditDrawer"
      :entity-id="entityId"
      @close="onDrawerClose()"
      @delete="onDrawerClose()"
    />

    <entity-drawer-duplicate
      v-model:show="showDuplicateDrawer"
      :entity-id="entityId"
      @close="onDrawerClose()"
    />

    <entity-drawer-parents
      v-model:show="showParentsDrawer"
      :entity-id="entityId"
      @close="onDrawerClose()"
    />

    <entity-drawer-rights
      v-model:show="showRightsDrawer"
      :entity-id="entityId"
      @close="onDrawerClose()"
    />
  </div>
</template>

<i18n lang="yaml">
  en:
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: Rights
  et:
    edit: Muuda
    duplicate: Dubleeri
    parents: Kuuluvus
    rights: Õigused
</i18n>
