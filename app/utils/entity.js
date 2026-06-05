export const useEntity = () => {
  const { userId } = useUser()

  const rawEntity = useState('entity.raw', () => null)

  const entityId = computed(() => rawEntity.value?._id)
  const typeId = computed(() => getValue(rawEntity.value?._type, 'reference'))
  const typeName = computed(() => getValue(rawEntity.value?._type, 'string'))

  const right = computed(() => ({
    owner: rawEntity.value?._owner?.some((x) => x.reference === userId.value) || false,
    editor: rawEntity.value?._editor?.some((x) => x.reference === userId.value) || false,
    expander: rawEntity.value?._expander?.some((x) => x.reference === userId.value) || false,
    viewer: rawEntity.value?._viewer?.some((x) => x.reference === userId.value) || false
  }))

  return {
    entityId,
    rawEntity,
    right,
    typeId,
    typeName
  }
}
