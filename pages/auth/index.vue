<script setup>
const runtimeConfig = useRuntimeConfig()

useHead({ title: 'Sign In · Entu' })

window.location = `${runtimeConfig.public.apiUrl}/auth/google?next=${window.location.origin}/auth/callback?key=`
</script>

<template>
  <div />
</template>
