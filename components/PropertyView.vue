<script setup>
import { useMainStore } from '~/stores/main'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  values: { type: Array, default: null }
})

const { n } = useI18n()
const mainStore = useMainStore()
const userStore = useUserStore()
const { language } = storeToRefs(mainStore)
const { account } = storeToRefs(userStore)

const localeValues = computed(() => props.values?.filter(x => !x.language || x.language === language.value))
</script>

<template>
  <div
    v-for="v in localeValues"
    :key="v._id"
    class="my-1"
  >
    <!-- <pre class="text-xs">{{ v }}</pre> -->
    <template v-if="v.reference">
      <nuxt-link class="link" :to="{ path:`/${account}/${v.reference}`}">
        {{ v.string }}
      </nuxt-link>
    </template>

    <template v-else-if="v.s3">
      <nuxt-link class="link" :to="{ path:`/${account}/file/${v._id}`}" target="_blank">
        {{ v.filename || v._id }}
      </nuxt-link>
      <span class="ml-2 text-sm">{{ humanFileSize(v.filesize) }}</span>
    </template>

    <template v-else-if="v.decimal">
      {{ n(parseFloat(v.decimal)) }}
    </template>

    <template v-else-if="v.string">
      {{ v.string }}
    </template>

    <template v-else>
      <pre class="text-xs" />
    </template>
  </div>
</template>
