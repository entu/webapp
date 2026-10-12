<script setup>
const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: undefined },
  providerGroups: { type: Array, required: true },
  // Returns the route location a provider button navigates to
  providerRoute: { type: Function, required: true }
})

const { t } = useI18n()

const buttonGroups = computed(() => props.providerGroups.map((group) => group.map((provider) => ({
  id: provider.id,
  icon: provider.icon,
  label: t(provider.label),
  onClick: () => navigateTo(props.providerRoute(provider))
}))))
</script>

<template>
  <my-auth-layout
    :description="description"
    :title="title"
  >
    <my-auth-buttons :groups="buttonGroups" />

    <slot />
  </my-auth-layout>
</template>
