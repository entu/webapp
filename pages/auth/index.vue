<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user.client'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { accounts } = storeToRefs(userStore)

useHead({ title: 'Entu · Sign In' })

onMounted(async () => {
  if (route.query.key) {
    await userStore.getAccounts(route.query.key)

    router.push(`/${accounts.value[0].account}`)
  } else {
    window.location = `${runtimeConfig.public.apiUrl}/auth/google?next=${window.location.origin}/auth/?key=`
  }
})
</script>
