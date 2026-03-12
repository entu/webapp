<script setup>
import { NPopover } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()
const { accountId } = useAccount()
const { userId } = useUser()

const props = defineProps({
  entity: { type: Object, required: true },
  right: { type: Object, default: () => ({}) },
  narrow: { type: Boolean, default: true },
  thumbnail: { type: String, default: undefined },
  photos: { type: Array, default: undefined }
})

const placement = computed(() => props.narrow ? 'top' : 'left')
</script>

<template>
  <entity-thumbnail
    v-if="thumbnail"
    class="print-as-is flex-none"
    :class="{ 'w-full': placement === 'left' }"
    :thumbnail="thumbnail"
    :photos="photos"
  />

  <template v-if="userId">
    <n-popover
      v-if="entity.type.label && entity.type.description"
      class="max-w-sm"
      :placement="placement"
    >
      <template #trigger>
        <nuxt-link
          class="rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-center text-xs hover:bg-slate-200"
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

    <nuxt-link
      v-else-if="entity.type.label"
      class="rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-center text-xs hover:bg-slate-200"
      :to="{ path: `/${accountId}/${entity.type._id}`, query: route.query }"
    >
      {{ entity.type.label }}
    </nuxt-link>

    <n-popover
      v-if="!entity._sharing"
      class="max-w-sm"
      :placement="placement"
    >
      <template #trigger>
        <nuxt-link
          class="flex items-center justify-center gap-1 rounded-md border border-green-300 bg-green-50 px-2 py-1 text-center text-xs text-green-600"
          :to="right.owner ? { path: route.path, query: route.query, hash: '#rights' } : {}"
        >
          <my-icon icon="sharing-private" />
          {{ t('sharingPrivate') }}
        </nuxt-link>
      </template>
      <div class="text-sm">
        {{ t('sharingPrivateDescription') }}
      </div>
    </n-popover>

    <n-popover
      v-if="entity._sharing === 'domain'"
      class="max-w-sm"
      :placement="placement"
    >
      <template #trigger>
        <nuxt-link
          class="flex items-center justify-center gap-1 rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1 text-center text-xs text-yellow-600"
          :to="right.owner ? { path: route.path, query: route.query, hash: '#rights' } : {}"
        >
          <my-icon icon="sharing-domain" />
          {{ t('sharingDomain') }}
        </nuxt-link>
      </template>
      <div class="text-sm">
        {{ t('sharingDomainDescription') }}
      </div>
    </n-popover>

    <n-popover
      v-if="entity._sharing === 'public'"
      class="max-w-sm"
      :placement="placement"
    >
      <template #trigger>
        <nuxt-link
          class="flex items-center justify-center gap-1 rounded-md border border-orange-300 bg-orange-50 px-2 py-1 text-center text-xs text-orange-600"
          :to="right.owner ? { path: route.path, query: route.query, hash: '#rights' } : {}"
        >
          <my-icon icon="sharing-public" />
          {{ t('sharingPublic') }}
        </nuxt-link>
      </template>
      <div class="text-sm">
        {{ t('sharingPublicDescription') }}
      </div>
    </n-popover>
  </template>
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
