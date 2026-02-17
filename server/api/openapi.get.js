import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Helper function to load tag descriptions from markdown files
const loadTagDescription = (filename) => {
  try {
    // If filename starts with ../, resolve from project root, otherwise from docs folder
    const filePath = filename.startsWith('../')
      ? resolve(process.cwd(), filename)
      : resolve(process.cwd(), 'docs', filename)
    return readFileSync(filePath, 'utf-8').trim()
  }
  catch (error) {
    console.error(`Failed to load ${filename}:`, error)
    return ''
  }
}

export default defineEventHandler(async () => {
  // Get the original OpenAPI spec from the default route
  const openapi = await $fetch('/api/docs/openapi.json')

  // Filter out paths that include /_
  if (openapi.paths) {
    const filteredPaths = Object.fromEntries(
      Object.entries(openapi.paths).filter(([path]) => path.startsWith('/api/')
        && !path.includes('/_')
        && !path.includes('/passkey')
        && !path.includes('/webhook')
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

  // Load API description from markdown file
  const apiDescription = loadTagDescription('api-description.md')
  if (apiDescription) {
    openapi.info.description = apiDescription
  }

  if (!openapi.components) {
    openapi.components = {}
  }

  // Remove all existing security schemes first
  if (openapi.components.securitySchemes) {
    delete openapi.components.securitySchemes
  }

  // Define only Bearer Auth as the available authentication method
  openapi.components.securitySchemes = {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token obtained from /api/auth endpoint'
    }
  }

  // Set global security to only show Bearer Auth option
  openapi.security = [{ bearerAuth: [] }]

  // Tags with file references
  const tagDefinitions = [
    { name: 'Authentication', file: 'authentication.md' },
    { name: 'Database', file: 'database.md' },
    { name: 'Entity', file: 'entity.md' },
    { name: 'Property', file: 'property.md' },
    { name: '1.1 Quick Start', file: 'quickstart.md' },
    { name: '1.2 Best Practices', file: 'best-practices.md' },
    { name: '2.3 Authentication', file: 'about-authentication.md' },
    { name: '2.4 Methods', file: 'authentication-methods.md' },
    { name: '2.5 Properties', file: 'authentication-properties.md' },
    { name: '2.6 Automatic User Creation', file: 'automatic-user-creation.md' },
    { name: '3.1 Entities', file: 'about-entities.md' },
    { name: '3.2 Entity Rights', file: 'entity-rights.md' },
    { name: '4.1 Properties', file: 'about-properties.md' },
    { name: '4.2 Formulas', file: 'formulas.md' },
    { name: '4.3 Files', file: 'files.md' },
    { name: '4.4 System', file: 'system-properties.md' }
  ]

  // Load descriptions from files
  openapi.tags = tagDefinitions.map(({ name, file }) => ({
    name,
    description: loadTagDescription(file)
  }))

  // Group tags for better navigation
  openapi['x-tagGroups'] = [
    {
      name: 'API Endpoints',
      tags: ['Authentication', 'Database', 'Entity', 'Property']
    },
    {
      name: '1. Getting Started',
      tags: ['1.1 Quick Start', '1.2 Best Practices']
    },
    {
      name: '2. Authentication',
      tags: ['2.3 Authentication', '2.4 Methods', '2.5 Properties', '2.6 Automatic User Creation']
    },
    {
      name: '3. Entities',
      tags: ['3.1 Entities', '3.2 Entity Rights']
    },
    {
      name: '4. Properties',
      tags: ['4.1 Properties', '4.2 Formulas', '4.3 Files', '4.4 System']
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
