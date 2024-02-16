import _forIn from 'lodash/forIn'
import _set from 'lodash/set'
import _toNumber from 'lodash/toNumber'
import _toSafeInteger from 'lodash/toSafeInteger'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const query = getQuery(event)

  const props = (query.props || '').split(',').filter(x => !!x)
  const group = (query.group || '').split(',').filter(x => !!x)
  const fields = {}
  let getThumbnail = props.length === 0

  if (props.length > 0) {
    props.forEach((f) => {
      if (f === '_thumbnail') {
        fields['private.photo.s3'] = true
        fields['public.photo.s3'] = true
        getThumbnail = true
      } else {
        fields[`private.${f}`] = true
        fields[`public.${f}`] = true
      }
    })
    fields.access = true
  }

  const sort = (query.sort || '').split(',').filter(x => !!x)
  const limit = _toSafeInteger(query.limit) || 100
  const skip = _toSafeInteger(query.skip) || 0
  const q = (query.q || '').toLowerCase().split(' ').filter(x => !!x)
  let sortFields = {}
  const filter = {}
  let search
  const equalSearch = []

  _forIn(event.queryStringParameters || {}, (v, k) => {
    if (k.includes('.')) {
      const fieldArray = k.split('.')
      const field = fieldArray.at(0)
      const type = fieldArray.at(1)
      const operator = fieldArray.at(2)
      let value

      switch (type) {
        case 'reference':
          value = new ObjectId(v)
          break
        case 'boolean':
          value = v.toLowerCase() === 'true'
          break
        case 'number':
          value = _toNumber(v)
          break
        case 'filesize':
          value = _toNumber(v)
          break
        case 'date':
          value = new Date(v)
          break
        case 'datetime':
          value = new Date(v)
          break
        default:
          if (operator === 'regex' && v.includes('/')) {
            value = new RegExp(v.split('/').at(1), v.split('/').at(2))
          } else if (operator === 'exists') {
            value = v.toLowerCase() === 'true'
          } else {
            value = v
          }
      }

      if (['gt', 'gte', 'lt', 'lte', 'ne', 'regex', 'exists'].includes(operator)) {
        _set(filter, [`private.${field}.${type}`, `$${operator}`], value)
      } else {
        filter[`private.${field}.${type}`] = value
        equalSearch.push({ text: { path: `private.${field}.${type}`, query: value } })
      }
    }
  })

  if (entu.user) {
    filter.access = { $in: [entu.user, 'public'] }
  } else {
    filter.access = 'public'
  }

  if (sort.length > 0) {
    sort.forEach((f) => {
      if (f.startsWith('-')) {
        sortFields[`private.${f.substring(1)}`] = -1
      } else {
        sortFields[`private.${f}`] = 1
      }
    })
  } else {
    sortFields = { _id: 1 }
  }

  if (q.length > 0) {
    _set(filter, ['$text', '$search'], q.map(x => `"${x}"`).join(' '))
    _set(filter, [entu.user ? 'search.private' : 'search.public', '$all'], q.map(x => new RegExp(x)))
  }

  const cleanedEntities = []
  let entities = 0
  let count = 0
  let pipeline = [{ $match: filter }]

  if (group.length > 0) {
    const groupIds = {}
    const unwinds = []
    const groupFields = { access: { $first: '$access' } }
    const projectIds = {
      'public._count': '$_count',
      'private._count': '$_count',
      access: true,
      _id: false
    }

    group.forEach((g) => {
      groupIds[g.replaceAll('.', '#')] = `$private.${g}`
      unwinds.push({ $unwind: { path: `$private.${g.split('.').at(0)}`, preserveNullAndEmptyArrays: true } })
    })

    Object.keys(fields).forEach((g) => {
      groupFields[g.replaceAll('.', '#')] = { $first: `$${g}` }
      projectIds[g] = `$${g.replaceAll('.', '#')}`
    })

    pipeline = [
      ...pipeline,
      ...unwinds,
      { $group: { ...groupFields, _id: groupIds, _count: { $count: {} } } },
      { $project: projectIds },
      { $sort: sortFields }
    ]

    if (!search) {
      pipeline.push({ $sort: sortFields })
    }
  } else {
    pipeline.push({ $sort: sortFields })
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limit })

    if (props.length > 0) {
      const projectIds = { access: true }

      Object.keys(fields).forEach((g) => {
        projectIds[g] = true
      })

      pipeline.push({ $project: projectIds })
    }
  }

  const countPipeline = [
    ...pipeline.filter(x => !Object.keys(x).includes('$sort') && !Object.keys(x).includes('$skip') && !Object.keys(x).includes('$limit')),
    { $count: '_count' }
  ]

  entities = await entu.db.collection('entity').aggregate(pipeline).toArray()
  count = await entu.db.collection('entity').aggregate(countPipeline).toArray()

  for (let i = 0; i < entities.length; i++) {
    const entity = await claenupEntity(entities[i], entu.user, getThumbnail)

    if (entity) cleanedEntities.push(entity)
  }

  return {
    entities: cleanedEntities,
    count: count?.at(0)?._count || 0,
    limit,
    skip
  }
})
