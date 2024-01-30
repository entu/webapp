<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButton, NButtonGroup, NSpin } from 'naive-ui'

const { t } = useI18n()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })

const rawEntity = ref()
const isLoading = ref(false)
const isUpdating = ref(false)

watch(entityId, loadEntity, { immediate: true })

const entityName = computed(() => getValue(rawEntity.value?.name))
const isPublic = computed(() => getValue(rawEntity.value?._public, 'boolean') || false)
const rights = ref([])

async function loadEntity () {
  isLoading.value = true

  if (entityId.value) {
    rawEntity.value = await apiGetEntity(entityId.value, [
      'name',
      '_viewer',
      '_expander',
      '_editor',
      '_owner',
      '_public'
    ])
  }

  rights.value = cloneArray([
    ...rawEntity.value?._viewer?.map(x => ({ ...x, type: 'viewer' })) || [],
    ...rawEntity.value?._expander?.map(x => ({ ...x, type: 'expander' })) || [],
    ...rawEntity.value?._editor?.map(x => ({ ...x, type: 'editor' })) || [],
    ...rawEntity.value?._owner?.map(x => ({ ...x, type: 'owner' })) || []
  ].sort((a, b) => a.string.localeCompare(b.string)))

  isLoading.value = false
}

function onUpdateRight (right) {
  console.log(right)
}

async function onClose () {
  await until(isUpdating).not.toBeTruthy()

  emit('close')
}
</script>

<template>
  <drawer
    :width="550"
    :title="t('title', { name: entityName })"
    @close="onClose()"
  >
    <n-spin :show="isUpdating">
      <div
        v-for="r in rights"
        :key="r._id"
        class="mb-4 flex items-center justify-between gap-2"
      >
        <div class="grow overflow-ellipsis">
          {{ r.string.trim() || r.reference }}
        </div>

        <n-button-group>
          <n-button
            round
            secondary
            :class="{ '!bg-blue-400 !text-white': r.type === 'viewer' }"
            @click="r.type = 'viewer'"
          >
            <template #icon>
              <icon icon="rights/view" />
            </template>
          </n-button>
          <n-button
            round
            secondary
            :class="{ '!bg-blue-400 !text-white': r.type === 'expander' }"
            @click="r.type = 'expander'"
          >
            <template #icon>
              <icon icon="add" />
            </template>
          </n-button>
          <n-button
            round
            secondary
            :class="{ '!bg-blue-400 !text-white': r.type === 'editor' }"
            @click="r.type = 'editor'"
          >
            <template #icon>
              <icon icon="rights/editor" />
            </template>
          </n-button>
          <n-button
            round
            secondary
            :class="{ '!bg-blue-400 !text-white': r.type === 'owner' }"
            @click="r.type = 'owner'"
          >
            <template #icon>
              <icon icon="rights/owner" />
            </template>
          </n-button>
        </n-button-group>

        <n-button
          circle
          quaternary
          type="error"
          @click="r.type = undefined"
        >
          <template #icon>
            <icon
              class="text-red-500"
              icon="delete"
            />
          </template>
        </n-button>
      </div>
    </n-spin>
  </drawer>
</template>

<i18n lang="yaml">
  en:
    title: Rights - {name}
    none: No rights
    viewer: Viewer
    expander: Expander
    editor: Editor
    owner: Owner
  et:
    title: Õigused - {name}
    none: Pole õigusi
    viewer: Vaataja
    expander: Laiendaja
    editor: Toimetaja
    owner: Omanik
</i18n>
