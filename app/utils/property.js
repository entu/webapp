// Maps a property type to the value object key that holds its content
// (e.g. a `text` property stores its content under `string`, a `file` under
// `filename`). Used when reading/writing a single property value.
export function propertyValueKey (type) {
  switch (type) {
    case 'text':
    case 'counter':
      return 'string'
    case 'file':
      return 'filename'
    default:
      return type
  }
}

// True when a property value carries no persisted id and no content for its
// type — i.e. an empty input row that should not be saved.
export function isEmptyPropertyValue (value, type) {
  if (value._id !== undefined) return false

  const content = value[propertyValueKey(type)]

  return content === undefined || content === null || content === ''
}
