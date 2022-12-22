<script setup>
import { useUserStore } from '~/stores/user.client'

const router = useRouter()
const userStore = useUserStore()

useHead({ title: 'Entu · Exit' })

userStore.signOut()
router.push({ path: '/' })
</script>
