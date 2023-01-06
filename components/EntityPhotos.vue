<script setup>
import { NImage, NImageGroup, NSpin } from 'naive-ui'

const props = defineProps({
  thumbnail: { type: String, required: true },
  photos: { type: Array, default: null }
})

const imageRef = ref()
const isLoading = ref(false)
const urlsLoaded = ref(false)
const urls = ref([])

async function loadImages () {
  if (!props.photos) return
  if (urlsLoaded.value) {
    imageRef.value.click()
    return
  }

  isLoading.value = true
  imageRef.value.click()

  for (const photo of props.photos.slice(1)) {
    const { url } = await apiGetProperty(photo._id)
    urls.value.push(url)
  }

  urlsLoaded.value = true
  isLoading.value = false
}
</script>

<template>
  <div
    class="h-32 w-32 flex items-center justify-center bg-cover rounded-lg cursor-pointer"
    :style="`background-image:url(${thumbnail})`"
    @click="loadImages()"
  >
    <n-spin
      v-if="isLoading"
      size="medium"
    />
  </div>
  <n-image-group>
    <n-image
      ref="imageRef"
      class="hidden"
      :src="thumbnail"
    />
    <n-image
      v-for="url in urls"
      :key="url"
      class="hidden"
      :src="url"
    />
  </n-image-group>
</template>
