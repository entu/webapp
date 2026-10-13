<script setup>
import { NPopover } from 'naive-ui'

const props = defineProps({
  property: { type: Object, required: true },
  entitySharing: { type: String, default: undefined }
})

const { t } = useI18n()
const { userId } = useUser()

// The property's own visibility when it is wider than the entity's default, shown to signed-in users only.
const sharing = computed(() => {
  const entity = props.entitySharing
  const property = props.property.sharing

  if (!userId.value || !entity || !property) {
    return false
  }

  if (entity === 'public' && property === 'public') {
    return { icon: 'sharing-public', class: 'text-orange-600 dark:text-orange-400', text: t('publicProperty') }
  }

  if ((entity === 'public' && property === 'domain') || (entity === 'domain' && ['domain', 'public'].includes(property))) {
    return { icon: 'sharing-domain', class: 'text-yellow-600 dark:text-yellow-400', text: t('domainProperty') }
  }

  return false
})
</script>

<template>
  <div
    v-if="sharing || (userId && property.description)"
    class="flex"
  >
    <n-popover
      v-if="sharing"
      class="max-w-sm text-sm"
      placement="top"
    >
      <template #trigger>
        <my-icon
          class="cursor-help text-sm"
          :class="sharing.class"
          :icon="sharing.icon"
        />
      </template>

      <div class="text-sm">
        {{ sharing.text }}
      </div>
    </n-popover>

    <n-popover
      v-if="userId && property.description"
      class="max-w-sm text-sm"
      placement="top"
    >
      <template #trigger>
        <my-icon
          class="cursor-help text-sm text-blue-900 dark:text-blue-300"
          icon="info"
        />
      </template>

      <my-markdown
        class="text-sm"
        :source="property.description"
      />
    </n-popover>
  </div>
</template>

<i18n lang="yaml">
  en:
    publicProperty: This property is public and visible to everyone.
    domainProperty: This property is visible to anyone who is logged in.
  et:
    publicProperty: See parameeter on avalik ja kõigile nähtav.
    domainProperty: See parameeter on nähtav kõigile sisse logitud kasutajatele.
</i18n>
