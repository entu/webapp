<script setup>
import { NButton, NCard, NInput, NSwitch } from 'naive-ui'

definePageMeta({ layout: 'blank' })
const { t } = useI18n()

const databaseName = ref('')
const types = ref([
  { value: 'person', label: t('typeNamePerson'), selected: true, disabled: true },
  { value: 'department', label: t('typeNameDepartment'), selected: false },
  { value: 'folder', label: t('typeNameFolder'), selected: false },
  { value: 'document', label: t('typeNameDocument'), selected: false },
  { value: 'book', label: t('typeNameBook'), selected: false }
])

function validateName () {
  databaseName.value = databaseName.value?.trim().replace(/[^a-zA-Z_]/g, '').toLowerCase()

  while (databaseName.value && !/^[a-zA-Z]/.test(databaseName.value)) {
    databaseName.value = databaseName.value.substring(1)
  }
}

function createDatabase () {
  console.log('Creating database', database.value)
}

onMounted(async () => {
  useHead({ title: t('title') })
})
</script>

<template>
  <div class="size-full py-8 bg-gray-50">
    <nuxt-link :to="{ path: '/' }">
      <img
        class="mt-6 mb-4 mx-auto h-24 w-24"
        src="/logo.png"
      >
    </nuxt-link>

    <div class="w-2/6 mt-8 mx-auto">
      <n-card
        :title="t('title')"
        closable
        @close="navigateTo({ path: '/' })"
      >
        <n-input
          v-model:value="databaseName"
          :placeholder="t('databaseName')"
          @keyup="validateName()"
        />
        <p class="mt-1 text-sm">
          {{ t('databaseInfo') }}
        </p>

        <div>
          <h2 class="mt-8 font-bold">
            {{ t('types') }}
          </h2>

          <div class="my-1">
            <div
              v-for="type in types"
              :key="type.value"
              class="py-2 border-b last-of-type:border-b-0 flex justify-between items-center"
            >
              {{ type.label }}
              <n-switch
                v-model:value="type.selected"
                :disabled="type.disabled"
              />
            </div>
          </div>

          <p class="mt-1 text-sm">
            {{ t('typesInfo') }}
          </p>
        </div>

        <n-button
          class="!w-full !mt-8"
          secondary
          size="large"
          strong
          :disabled="!databaseName"
          @click="createDatabase()"
        >
          {{ t('create') }}
        </n-button>
      </n-card>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Create a new database
    databaseName: Database Name
    databaseInfo: Database name can contain only letters and underscores. It must start with a letter.
    types: Data Types
    typesInfo: Data types are used to define data. Select the desired pre-set types. You can also create new data types later.
    typeNamePerson: Person
    typeNameDepartment: Department
    typeNameFolder: Folder
    typeNameDocument: Document
    typeNameBook: Book
    create: Create Database
  et:
    title: Loo uus andmebaas
    databaseName: Andmebaasi nimi
    databaseInfo: Andmebaasi nimi võib sisaldada ainult tähti ja allkriipse ning see peab algama tähega.
    types: Andmetüübid
    typesInfo: Andmetüüpe kasutatakse andmete määratlemiseks. Valige soovitud eelseadistatud tüübid. Uusi andmetüüpe saate luua ka hiljem.
    typeNamePerson: Persoon
    typeNameDepartment: Osakond
    typeNameFolder: Kaust
    typeNameDocument: Dokument
    typeNameBook: Raamat
    create: Loo andmebaas
</i18n>
