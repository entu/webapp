<script setup>
import { NAlert, NSpin } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()

const result = ref()

onMounted(async () => {
  useHead({ title: t('title') })

  result.value = await completeSignIn(route.query.key, route.query.invite)

  if (result.value.error) return

  await navigateTo(result.value.to)
})
</script>

<template>
  <div
    v-if="result?.error"
    class="flex min-h-full items-center justify-center p-4"
  >
    <div class="flex w-full max-w-sm flex-col gap-6">
      <n-alert
        type="error"
        :title="t('errorTitle')"
      >
        {{ t(`error-${result.error}`) }}
      </n-alert>

      <my-button
        block
        size="large"
        type="primary"
        :label="t('continue')"
        @click="navigateTo(result.to || '/')"
      />
    </div>
  </div>

  <n-spin
    v-else
    class="size-full"
    show
    :delay="200"
  />
</template>

<i18n lang="yaml">
  en:
    title: Sign In
    errorTitle: Sign-in failed
    error-signIn: Signing in did not succeed. Please try again.
    error-invite: This invitation is invalid, has expired or has already been used. Ask for a new invitation.
    error-conflict: You signed in with a login method that already belongs to another person in this database, so the invitation could not be accepted. Use a different login method.
    continue: Continue
  et:
    title: Sisene
    errorTitle: Sisselogimine ebaõnnestus
    error-signIn: Sisselogimine ei õnnestunud. Palun proovi uuesti.
    error-invite: See kutse on vigane, aegunud või juba kasutatud. Küsi uus kutse.
    error-conflict: Sa logisid sisse viisiga, mis kuulub selles andmebaasis juba teisele isikule, seega ei saanud kutset vastu võtta. Kasuta teist sisselogimisviisi.
    continue: Jätka
</i18n>
