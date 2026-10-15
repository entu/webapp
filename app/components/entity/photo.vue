<script setup>
import { NImage, NImageGroup } from 'naive-ui'

const props = defineProps({
  photos: { type: Array, default: undefined },
  thumbnail: { type: String, required: true }
})

const { t } = useI18n()

const imageRef = useTemplateRef('imageRef')
const isLoading = ref(false)
const urlsLoaded = ref(false)
const urls = ref([])

// The instance can be reused across entity navigations, so clear the lazily
// loaded gallery whenever the thumbnail (i.e. the entity) changes — otherwise
// the previous entity's photos linger.
watch(() => props.thumbnail, () => {
  isLoading.value = false
  urlsLoaded.value = false
  urls.value = []
})

async function loadImages () {
  useAnalytics('show_photo')

  if (!props.photos) return

  if (urlsLoaded.value) {
    imageRef.value.click()
    return
  }

  isLoading.value = true
  imageRef.value.click()

  for (const photo of props.photos) {
    const { url } = await apiGetProperty(photo._id)

    urls.value.push(url)
  }

  urlsLoaded.value = true
  isLoading.value = false
}
</script>

<template>
  <!-- The photo is a CSS background that opens the gallery, so it is a named button -->
  <div
    class="flex cursor-pointer items-center justify-center bg-cover bg-center"
    role="button"
    tabindex="0"
    :aria-label="t('showPhotos')"
    :style="`background-image:url(${thumbnail})`"
    v-bind="$attrs"
    @click="loadImages()"
    @keydown.enter.prevent="loadImages()"
    @keydown.space.prevent="loadImages()"
  >
    <my-spinner
      v-if="isLoading"
      size="medium"
    />
  </div>

  <n-image-group v-if="photos && photos.length > 1">
    <n-image
      v-for="url in urls"
      :key="url"
      class="hidden!"
      :alt="t('photo')"
      :src="url"
    />
  </n-image-group>
  <n-image
    v-else
    ref="imageRef"
    class="hidden!"
    :alt="t('photo')"
    :src="urls.at(0)"
  />
</template>

<i18n lang="yaml">
  en:
    photo: Photo
    showPhotos: Show Photos
  et:
    photo: Foto
    showPhotos: Näita fotosid
</i18n>
