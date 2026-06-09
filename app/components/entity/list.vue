<script setup>
import { NEmpty, NSpin } from 'naive-ui'

const route = useRoute()
const { t } = useI18n()
const { accountId } = useAccount()

const listElement = useTemplateRef('listElement')

const {
  entitiesList,
  entitiesCount,
  isLoading,
  isLoadingOnScroll,
  scrollIdx
} = useEntities(listElement, {
  fetchProps: ['photo', 'name'],
  mapEntity: (entity) => ({ ...entity, color: randomColor('200!') })
})
</script>

<template>
  <div class="flex h-full flex-col print:hidden">
    <div
      ref="listElement"
      class="relative grow overflow-y-auto"
    >
      <nuxt-link
        v-for="(entity, idx) in entitiesList"
        :key="entity._id"
        class="list-item"
        :class="{
          'font-bold ': idx === scrollIdx,
          'active': entity._id === route.params.entityId,
        }"
        :to="{ path: `/${accountId}/${entity._id}`, query: route.query }"
      >
        <entity-avatar
          class="list-item-img"
          :class="entity.color"
          :entity-id="entity._id"
          :has-photo="!!entity.photo?.length"
        >
          <div
            class="list-item-img"
            :class="entity.color"
          >
            {{ `${getValue(entity.name)}`.at(0) }}
          </div>
        </entity-avatar>

        <div class="list-item-text">
          {{ getValue(entity.name) || entity._id }}
        </div>
      </nuxt-link>
    </div>

    <div
      v-if="isLoading && !isLoadingOnScroll"
      class="flex size-full items-center justify-center"
    >
      <n-spin />
    </div>

    <entity-list-loading
      v-if="entitiesCount !== 0"
      :is-loading="isLoadingOnScroll"
      :loaded-count="entitiesList.length"
      :total-count="entitiesCount"
    />

    <div
      v-if="entitiesCount === 0"
      class="flex size-full items-center justify-center"
    >
      <n-empty :description="t('noResults')" />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.list-item {
  @apply h-12 px-3;
  @apply flex items-center gap-3;
  @apply hover:bg-zinc-50;
  @apply hover:border-y border-zinc-50;
  @apply focus:outline-none focus-visible:outline-none;
  touch-action: manipulation;
}

@media (hover: none) {
  .list-item:hover {
    background-color: transparent;
    border-top-width: 0;
    border-bottom-width: 0;
  }
}

.list-item-img {
  @apply size-7 rounded-full object-cover;
  @apply flex-none flex items-center justify-center;
  @apply uppercase text-sm text-white font-bold;
}

.list-item-text {
  @apply py-3;
  @apply flex-auto truncate;
  @apply border-t border-white;
}

.list-item.active {
  @apply bg-zinc-100 hover:bg-zinc-100;
  @apply hover:border-y border-zinc-100;
}

.list-item.active  > .list-item-text {
  @apply border-white!;
}

.list-item:hover + .list-item > .list-item-text {
  @apply border-zinc-50!;
}

.list-item.active + .list-item > .list-item-text {
  @apply border-zinc-100!;
}

.list-item:not(:first-child):not(:hover) > .list-item-text {
  @apply border-zinc-200;
}
</style>

<i18n lang="yaml">
  en:
    noResults: No entities found
  et:
    noResults: Objekte ei leitud
</i18n>
