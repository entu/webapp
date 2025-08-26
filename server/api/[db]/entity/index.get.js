defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Get entities list with advanced filtering, sorting, and grouping capabilities',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'db',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          description: 'Database name'
        }
      },
      {
        name: 'props',
        in: 'query',
        schema: {
          type: 'string',
          description: 'Comma-separated list of properties to include'
        }
      },
      {
        name: 'group',
        in: 'query',
        schema: {
          type: 'string',
          description: 'Comma-separated list of grouping fields'
        }
      },
      {
        name: 'sort',
        in: 'query',
        schema: {
          type: 'string',
          description: 'Comma-separated list of sort fields'
        }
      },
      {
        name: 'limit',
        in: 'query',
        schema: {
          type: 'integer',
          default: 100,
          description: 'Maximum number of results to return'
        }
      },
      {
        name: 'skip',
        in: 'query',
        schema: {
          type: 'integer',
          default: 0,
          description: 'Number of results to skip'
        }
      },
      {
        name: 'q',
        in: 'query',
        schema: {
          type: 'string',
          description: 'Search query string'
        }
      }
    ],
    responses: {
      200: {
        description: 'List of entities with their properties',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Paginated list of entities with metadata',
              properties: {
                entities: {
                  type: 'array',
                  description: 'Array of entity objects',
                  items: {
                    $ref: '#/components/schemas/Entity'
                  }
                },
                count: {
                  type: 'integer',
                  description: 'Total number of entities matching the query',
                  minimum: 0,
                  example: 14
                },
                limit: {
                  type: 'integer',
                  description: 'Maximum entities returned in this response',
                  minimum: 1,
                  example: 100
                },
                skip: {
                  type: 'integer',
                  description: 'Number of entities skipped',
                  minimum: 0,
                  example: 0
                }
              },
              required: ['entities', 'count', 'limit', 'skip']
            }
          }
        }
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      403: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const query = getQuery(event)

  const props = (query.props || '').split(',').filter((x) => !!x)
  const group = (query.group || '').split(',').filter((x) => !!x)
  const fields = {}
  let getThumbnail = props.length === 0

  if (props.length > 0) {
    props.forEach((f) => {
      if (f === '_thumbnail' && !props.includes('photo')) {
        fields['private.photo'] = true
        fields['public.photo'] = true
        getThumbnail = true
      }
      else {
        fields[`private.${f}`] = true
        fields[`public.${f}`] = true
        fields[`domain.${f}`] = true
      }
    })
    fields.access = true
  }

  const sort = (query.sort || '').split(',').filter((x) => !!x)
  const limit = parseInt(query.limit) || 100
  const skip = parseInt(query.skip) || 0
  const q = (query.q || '').toLowerCase().split(' ')
    .filter((x) => x.length > 0)
    .map((term) => term.substring(0, 20)) // Truncate search terms to match index limit
  let sortFields = {}
  const filter = {}

  for (const k in query) {
    if (!k.includes('.')) continue

    const v = query[k]
    const fieldArray = k.split('.')
    const field = fieldArray.at(0)
    const type = fieldArray.at(1)
    const operator = fieldArray.at(2)
    let value

    switch (type) {
      case 'reference':
        value = operator === 'in' ? v.split(',').map(getObjectId) : getObjectId(v)
        break
      case 'boolean':
        value = operator === 'in' ? v.split(',').map((x) => x.toLowerCase() === 'true') : v.toLowerCase() === 'true'
        break
      case 'number':
        value = operator === 'in' ? v.split(',').map(Number) : Number(v)
        break
      case 'filesize':
        value = operator === 'in' ? v.split(',').map(Number) : Number(v)
        break
      case 'date':
        value = operator === 'in' ? v.split(',').map((x) => new Date(x)) : new Date(v)
        break
      case 'datetime':
        value = operator === 'in' ? v.split(',').map((x) => new Date(x)) : new Date(v)
        break
      default:
        if (operator === 'regex' && v.includes('/')) {
          value = new RegExp(v.split('/').at(1), v.split('/').at(2))
        }
        else if (operator === 'exists') {
          value = v.toLowerCase() === 'true'
        }
        else if (operator === 'in') {
          value = v.split(',')
        }
        else {
          value = v
        }
    }

    if (['gt', 'gte', 'lt', 'lte', 'ne', 'regex', 'exists', 'in'].includes(operator)) {
      filter[`private.${field}.${type}`] = {
        ...filter[`private.${field}.${type}`] || {},
        [`$${operator}`]: value
      }
    }
    else {
      filter[`private.${field}.${type}`] = value
    }
  }

  if (entu.user) {
    filter.access = { $in: [entu.user, 'domain', 'public'] }
  }
  else {
    filter.access = 'public'
  }

  if (sort.length > 0) {
    sort.forEach((f) => {
      if (f.startsWith('-')) {
        sortFields[`private.${f.substring(1)}`] = -1
      }
      else {
        sortFields[`private.${f}`] = 1
      }
    })
  }
  else {
    sortFields = { _id: 1 }
  }

  if (q.length > 0) {
    if (entu.user) {
      filter['search.private'] = { $all: q }
    }
    else {
      filter['search.public'] = { $all: q }
    }
  }

  const cleanedEntities = []
  let pipeline = [{ $match: filter }]

  if (group.length > 0) {
    const groupIds = {}
    const groupFields = { access: { $first: '$access' } }
    const projectIds = {
      'public._count': '$_count',
      'private._count': '$_count',
      'domain._count': '$_count',
      access: true,
      _id: false
    }

    group.forEach((g) => {
      groupIds[g.replaceAll('.', '#')] = `$private.${g}`
    })

    Object.keys(fields).forEach((g) => {
      groupFields[g.replaceAll('.', '#')] = { $first: `$${g}` }
      projectIds[g] = `$${g.replaceAll('.', '#')}`
    })

    pipeline = [
      ...pipeline,
      { $group: { ...groupFields, _id: groupIds, _count: { $count: {} } } },
      { $project: projectIds },
      { $sort: sortFields }
    ]
  }
  else {
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
    ...pipeline.filter((x) => !Object.keys(x).includes('$sort') && !Object.keys(x).includes('$skip') && !Object.keys(x).includes('$limit')),
    { $count: '_count' }
  ]

  const [entities, count] = await Promise.all([
    entu.db.collection('entity').aggregate(pipeline).toArray(),
    entu.db.collection('entity').aggregate(countPipeline).toArray()
  ])

  for (let i = 0; i < entities.length; i++) {
    const entity = await cleanupEntity(entu, entities[i], getThumbnail)

    if (entity) cleanedEntities.push(entity)
  }

  return {
    pipeline,
    pipelineCount: entities.length,
    entities: cleanedEntities,
    count: count?.at(0)?._count || 0,
    limit,
    skip
  }
})
