export default defineEventHandler(async () => {
  // Get the original OpenAPI spec from the default route
  const openapi = await $fetch('/api/docs/openapi.json')

  // Filter out paths that include /_
  if (openapi.paths) {
    const filteredPaths = Object.fromEntries(
      Object.entries(openapi.paths).filter(([path]) => path.startsWith('/api/')
        && !path.includes('/_')
        && !path.startsWith('/api/docs')
        && !path.startsWith('/api/openapi')
        && !path.startsWith('/api/passkey')
        && !path.startsWith('/api/stripe')
      )
    )
    openapi.paths = filteredPaths
  }

  // Add additional OpenAPI metadata that Nitro config doesn't support
  openapi.servers = [
    {
      url: 'https://entu.app'
    }
  ]

  if (!openapi.components) {
    openapi.components = {}
  }

  openapi.components.securitySchemes = {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token obtained from /api/auth endpoint'
    }
  }

  // Tags
  openapi.tags = [
    { name: 'Authentication' },
    { name: 'Database' },
    { name: 'Entity' },
    { name: 'Property' },
    {
      name: 'System properties',
      description: `Entu system properties begin with _. Those properties are:

- _type - Reference to entity's type.
- _parent - Reference to parent entity.
- _sharing - *private*, *domain* or *public*.
- _inheritrights - Inherits rights from the parent entity. Entity-specific rights override inherited rights.
- _viewer - Reference to who can view this entity.
- _expander - Reference to who can add new entitys under this entity.
- _editor - Reference to who can change this entity's properties (except rights!).
- _owner - Reference to who can do anything with this entity (view, change, delete and manage rights).
`
    }
  ]

  // Models - Core data structures for the Entu API
  if (!openapi.components.schemas) {
    openapi.components.schemas = {}
  }

  // Entity - Core entity model with flattened properties structure
  openapi.components.schemas.Entity = {
    type: 'object',
    description: 'Entity object with flattened properties structures',
    properties: {
      _id: {
        type: 'string',
        description: 'Unique entity identifier',
        example: '6798938432faaba00f8fc72f'
      },
      _type: {
        type: 'string',
        description: 'Reference to entity type definition',
        example: '6798938432faaba00f8fc72e'
      },
      _owner: {
        type: 'array',
        description: 'Entity owners',
        items: {
          $ref: '#/components/schemas/Property'
        }
      },
      _created: {
        type: 'array',
        description: 'Creation information',
        items: {
          $ref: '#/components/schemas/Property'
        }
      },
      _sharing: {
        type: 'array',
        description: 'Sharing settings',
        items: {
          $ref: '#/components/schemas/Property'
        }
      },
      _thumbnail: {
        type: 'string',
        description: 'Thumbnail URL for the entity',
        format: 'uri',
        example: 'https://entu.app/api/entity/thumbnail/6798938432faaba00f8fc72f'
      }
    },
    additionalProperties: {
      type: 'array',
      description: 'Dynamic properties with values based on entity type. Property names vary by entity type (e.g., "name", "manufacturer", "color", etc.)',
      items: {
        $ref: '#/components/schemas/Property'
      }
    },
    required: ['_id', '_type']
  }

  // Property - Individual property with typed values and metadata
  openapi.components.schemas.Property = {
    type: 'object',
    description: 'Property object containing typed values and metadata.',
    properties: {
      _id: {
        type: 'string',
        description: 'Unique property identifier',
        example: '6798938532faaba00f8fc761'
      },
      type: {
        type: 'string',
        description: 'Property type defining the data structure',
        example: 'manufacturer'
      },
      string: {
        type: 'string',
        description: 'String value (present for string properties) or display name (present for reference properties)',
        example: 'Prusament'
      },
      number: {
        type: 'number',
        description: 'Numeric value (present when property type supports numeric values)'
      },
      boolean: {
        type: 'boolean',
        description: 'Boolean value (present when property type supports boolean values)'
      },
      reference: {
        type: 'string',
        description: 'Reference to another entity ID (present when property type is reference)',
        example: '6798938532faaba00f8fc75f'
      },
      date: {
        type: 'string',
        format: 'date',
        description: 'Date value (present when property type supports date values)'
      },
      datetime: {
        type: 'string',
        format: 'date-time',
        description: 'DateTime value (present when property type supports datetime values)',
        example: '2025-01-28T08:21:25.637Z'
      },
      filename: {
        type: 'string',
        description: 'File name (present when property type is file)'
      },
      filesize: {
        type: 'integer',
        description: 'File size in bytes (present when property type is file)',
        minimum: 0
      },
      filetype: {
        type: 'string',
        description: 'MIME type (present when property type is file)',
        example: 'image/jpeg'
      },
      language: {
        type: 'string',
        description: 'Language code for multilingual properties',
        example: 'en'
      },
      entity: {
        type: 'string',
        description: 'Entity ID this property belongs to',
        example: '6798938532faaba00f8fc75f'
      },
      created: {
        type: 'object',
        description: 'Property creation metadata',
        properties: {
          at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2025-01-28T08:21:25.637Z'
          },
          by: {
            type: 'string',
            description: 'ID of user who created the property',
            example: '506e7c33dcb4b5c4fde735d0'
          }
        },
        required: ['at', 'by']
      }
    },
    required: ['_id', 'type', 'entity', 'created']
  }

  // Error - Standard error response format used across all API endpoints
  openapi.components.schemas.Error = {
    type: 'object',
    description: 'Standard error response format',
    properties: {
      error: {
        type: 'string',
        description: 'Error message describing what went wrong'
      },
      statusCode: {
        type: 'integer',
        description: 'HTTP status code',
        example: 400
      },
      statusMessage: {
        type: 'string',
        description: 'HTTP status message',
        example: 'Bad Request'
      }
    },
    required: ['error', 'statusCode', 'statusMessage']
  }

  // Update API paths to reference the new schemas
  if (openapi.paths) {
    // Update error responses across all endpoints
    Object.keys(openapi.paths).forEach((path) => {
      Object.keys(openapi.paths[path]).forEach((method) => {
        const operation = openapi.paths[path][method]
        if (operation.responses) {
          // Update common error responses
          ['400', '401', '403', '404', '500'].forEach((statusCode) => {
            if (operation.responses[statusCode]?.content?.['application/json']?.schema) {
              operation.responses[statusCode].content['application/json'].schema = {
                $ref: '#/components/schemas/Error'
              }
            }
          })
        }
      })
    })
  }

  return openapi
})
