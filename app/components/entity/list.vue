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
  fetchProps: ['photo', 'name']
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
          :entity-id="entity._id"
          :has-photo="!!entity.photo?.length"
        >
          <div
            class="list-item-img"
            :style="{ backgroundColor: derivedColor(entity._id) }"
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
@reference "~/assets/tailwind.css";

.list-item {
  @apply h-12 px-3;
  @apply flex items-center gap-3;
  @apply hover:bg-slate-900/5 dark:hover:bg-white/5;
  @apply hover:border-y border-transparent;
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
  @apply border-t border-transparent;
}

/* Hover and selection tint the glass list like the side menu: translucent slate-900, translucent white in dark mode. */
.list-item.active {
  @apply bg-slate-900/10 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/10;
  @apply hover:border-y border-transparent;
}

.list-item.active  > .list-item-text {
  @apply border-transparent!;
}

.list-item.active + .list-item > .list-item-text {
  @apply border-transparent!;
}

@media (hover: hover) {
  .list-item:hover + .list-item > .list-item-text {
    @apply border-transparent!;
  }

  .list-item:not(:first-child):not(:hover) > .list-item-text {
    @apply border-slate-900/10 dark:border-white/10;
  }
}

@media (hover: none) {
  .list-item:not(:first-child) > .list-item-text {
    @apply border-slate-900/10 dark:border-white/10;
  }
}
</style>

<i18n lang="yaml">
  en:
    noResults: No entities found
  et:
    noResults: Objekte ei leitud
</i18n>
