<script setup>
import { NPopover } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()
const { accountId } = useAccount()

const props = defineProps({
  entity: { type: Object, required: true },
  parents: { type: Array, default: undefined },
  photos: { type: Array, default: undefined },
  thumbnail: { type: String, default: undefined },
  right: { type: Object, default: () => ({}) },
  narrow: { type: Boolean, default: false }
})

// Shared with the toolbars, so the band and the toolbar above it always change color together.
const { headerColor, headerGradient } = useEntity()

const sharing = computed(() => {
  if (props.entity._sharing === 'public') {
    return {
      icon: 'sharing-public',
      class: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
      label: t('sharingPublic'),
      description: t('sharingPublicDescription')
    }
  }

  if (props.entity._sharing === 'domain') {
    return {
      icon: 'sharing-domain',
      class: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
      label: t('sharingDomain'),
      description: t('sharingDomainDescription')
    }
  }

  return {
    icon: 'sharing-private',
    class: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    label: t('sharingPrivate'),
    description: t('sharingPrivateDescription')
  }
})

// A cover shows when the entity has a photo or its type defines a photo property (then empty), and title, type and parents clear it.
const showsCover = computed(() => !!props.photos?.length || !!props.entity.props?.some((x) => x.name === 'photo'))

// Clears the cover and, from md up, lines up with the property values column (140px label + 16px gap).
const indentClass = computed(() => ({
  'md:pl-39': showsCover.value,
  'pl-29': showsCover.value && props.narrow,
  'pl-37': showsCover.value && !props.narrow
}))

const parentList = computed(() => props.parents?.filter((x) => x.reference) || [])
</script>

<template>
  <div>
    <div
      class="print-as-is relative flex flex-col justify-end gap-2 bg-fixed [print-color-adjust:exact] print:bg-scroll"
      :class="{
        'min-h-24 px-4 pt-4 pb-3': narrow,
        'min-h-28 px-7 pt-4 pb-3.5': !narrow,
      }"
      :style="{ backgroundImage: headerGradient }"
    >
      <div
        class="flex flex-col items-start gap-2"
        :class="indentClass"
      >
        <h1
          class="line-clamp-2 text-2xl font-bold text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.2)]"
          @click="$event.altKey && navigateTo({ path: route.path, query: route.query, hash: '#debug' }, { replace: true })"
        >
          {{ entity.name?.trim() || entity._id }}
        </h1>

        <n-popover
          v-if="entity.type.label"
          class="max-w-sm"
          placement="bottom"
          :disabled="!entity.type.description"
        >
          <template #trigger>
            <nuxt-link
              class="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white hover:bg-white/30"
              :to="{ path: `/${accountId}/${entity.type._id}`, query: route.query }"
            >
              {{ entity.type.label }}
            </nuxt-link>
          </template>
          <my-markdown
            class="text-sm"
            :source="entity.type.description"
          />
        </n-popover>
      </div>

      <div
        v-if="showsCover"
        class="print-as-is absolute bottom-0 translate-y-1/3 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/40"
        :class="{
          'left-4 size-24': narrow,
          'left-7 size-32': !narrow,
        }"
      >
        <entity-photo
          v-if="thumbnail"
          class="print-as-is size-full"
          :photos="photos"
          :thumbnail="thumbnail"
        />

        <!-- Empty or still loading cover: the entity's color, half see-through -->
        <div
          v-else
          class="print-as-is size-full backdrop-blur-md [print-color-adjust:exact]"
          :style="{ backgroundColor: `color-mix(in srgb, ${headerColor} 50%, transparent)` }"
        />
      </div>
    </div>

    <div
      class="flex items-start gap-2 pt-3.5 pb-5"
      :class="{
        'px-4': narrow,
        'px-7': !narrow,
        'min-h-[78px]': showsCover,
      }"
    >
      <div
        class="flex min-w-0 grow flex-wrap gap-1.5"
        :class="indentClass"
      >
        <nuxt-link
          v-for="parent in parentList"
          :key="parent._id"
          class="flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          :to="{ path: `/${accountId}/${parent.reference}`, query: route.query }"
        >
          <my-icon
            class="flex-none text-xs"
            icon="folder-parent"
          />
          <span class="truncate">{{ parent.string || parent.reference }}</span>
        </nuxt-link>
      </div>

      <n-popover
        class="max-w-sm"
        placement="bottom"
      >
        <template #trigger>
          <nuxt-link
            class="flex flex-none items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
            :class="sharing.class"
            :to="right.owner ? { path: route.path, query: route.query, hash: '#rights' } : {}"
          >
            <my-icon
              class="text-xs"
              :icon="sharing.icon"
            />
            {{ sharing.label }}
          </nuxt-link>
        </template>
        <div class="text-sm">
          {{ sharing.description }}
        </div>
      </n-popover>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    sharingPrivate: Private
    sharingPrivateDescription: Only authorized users (below) can view this entity. Login is required.
    sharingDomain: Anyone with account
    sharingDomainDescription: All signed in users can view this entity. Login is required.
    sharingPublic: Public on the web
    sharingPublicDescription: Anyone on the Internet can view the public parameters of this entity. No login required.
  et:
    sharingPrivate: Privaatne
    sharingPrivateDescription: Seda objekti saavad vaadata ainult õigustega kasutajad. Sisselogimine on vajalik.
    sharingDomain: Kõik kasutajad
    sharingDomainDescription: Kõik kasutajad saavad vaadata seda objekti. Sisselogimine on vajalik.
    sharingPublic: Objekt on avalik
    sharingPublicDescription: Igaüks Internetis saab vaadata selle objekti avalikke parameetreid. Sisselogimine pole vajalik.
</i18n>
