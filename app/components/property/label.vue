<script setup>
import { NPopover } from 'naive-ui'

const props = defineProps({
  property: { type: Object, required: true },
  entitySharing: { type: String, default: undefined },
  stacked: { type: Boolean, default: false }
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

const label = computed(() => props.property.values?.length > 1
  ? props.property.labelPlural || props.property.label || props.property.name
  : props.property.label || props.property.name)
</script>

<template>
  <div class="flex justify-start md:justify-end md:text-right">
    <span class="truncate">{{ label }}</span>

    <div
      class="flex"
      :class="{
        'mt-1.5 w-2.5 flex-col gap-0.5': stacked,
        '-my-0.5!': stacked && sharing && userId && property.description,
        'gap-1 opacity-60 hover:opacity-100': !stacked,
      }"
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
