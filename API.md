# Entu API Documentation

## Overview

The Entu API provides RESTful endpoints for managing entities, properties, and databases. All API responses are in JSON format.

**Base URL:** `https://entu.app/api`

**Authentication:** Most endpoints require JWT authentication via Bearer token in the Authorization header.

## Data Model

### Entity Structure
Entities in Entu have a flattened property structure where each property type is an array:

```json
{
  "_id": "entity-id",
  "_type": [
    {
      "_id": "property-id",
      "reference": "type-entity-id",
      "string": "book"
    }
  ],
  "title": [
    {
      "_id": "property-id",
      "string": "The Hobbit",
      "language": "en"
    }
  ],
  "price": [
    {
      "_id": "property-id",
      "number": 29.99
    }
  ]
}
```

### Property Types
Each property can have the following value types:
- **string** - Text value (also used as display name for references)
- **number** - Numeric value
- **boolean** - Boolean value
- **reference** - Reference to another entity ID
- **date** - Date value (YYYY-MM-DD)
- **datetime** - DateTime value (ISO 8601 format)
- **filename** - File name
- **filesize** - File size in bytes
- **filetype** - MIME type
- **language** - Language code for multilingual properties

## Authentication

### GET /api/auth
Authenticates user by API key. API key must be sent in Bearer authorization header. Returns array of objects containing JWT tokens for accessing databases where user exists. Use this token (in Bearer authorization header) for database, entity and property requests.

#### Query parameters
- **db** - Database name. Optional. If set, authentication is done only for this database.

#### Example request
```http
GET /api/auth HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer nEkPYET5fYjJqktNz9yfLxPF
```

#### Example response
```json
{
  "accounts": [
    {
      "_id": "mydatabase",
      "name": "mydatabase",
      "user": {
        "_id": "npfwb8fv4ku7tzpq5yjarncc",
        "name": "User 1"
      }
    },
    {
      "_id": "anotherdatabase",
      "name": "anotherdatabase",
      "user": {
        "_id": "sgkjlrq2evnmc3awmgnhfbb9",
        "name": "User 2"
      }
    }
  ],
  "token": "hNGcQgaeKh7ptWF5FVPbfKgpR5ZHCzT5cbA4BQWtmWGkfdQHg5HLDMCB8GwKw8gG"
}
```

**Note**: The `accounts` property contains database information for backward compatibility.




### GET /api/auth/{ provider }
Redirects user to OAuth.ee for authentication. After successful authentication:
- If query parameter *next* is set, user is redirected to given url. Temporary API key is added to url end.
- If next is not set returns temporary API key.

Use this temporary API key to get JWT tokens from [/auth](#get-auth). This key can be used only once.

#### Path parameters
- **provider** - Authentication provider - apple, google, smart-id, mobile-id or id-card.

#### Query parameters
- **next** - Url where user is redirected after successful auth.

#### Example response
```json
{
  "key": "M2s8xKpwxG77JYxbx7xw4cS9"
}
```




## Passkey Authentication

### GET /api/passkey/authenticate
Generate WebAuthn authentication options for passkey login. No authentication required.

#### Example response
```json
{
  "challenge": "base64url-encoded-challenge",
  "rpId": "entu.app",
  "allowCredentials": [],
  "userVerification": "preferred"
}
```


### GET /api/passkey/register
Generate WebAuthn registration options for passkey registration. Requires JWT authentication.

#### Example response
```json
{
  "challenge": "base64url-encoded-challenge",
  "rp": {
    "name": "Entu",
    "id": "entu.app"
  },
  "user": {
    "id": "base64url-encoded-user-id",
    "name": "user@example.com",
    "displayName": "user@example.com"
  },
  "pubKeyCredParams": [
    { "alg": -7, "type": "public-key" },
    { "alg": -257, "type": "public-key" }
  ],
  "authenticatorSelection": {
    "userVerification": "preferred",
    "residentKey": "preferred"
  }
}
```


### POST /api/passkey/register
Complete WebAuthn passkey registration. Requires JWT authentication.

#### Request body
```json
{
  "id": "credential-id",
  "rawId": "raw-credential-id",
  "response": {
    "clientDataJSON": "base64-encoded-client-data",
    "attestationObject": "base64-encoded-attestation"
  },
  "type": "public-key",
  "expectedChallenge": "challenge-from-registration-options",
  "deviceName": "iPhone 15 Pro"
}
```

#### Example response
```json
{
  "success": true,
  "_id": "user-entity-id",
  "properties": {
    "entu_passkey": [
      {
        "_id": "property-id",
        "device": "iPhone 15 Pro"
      }
    ]
  }
}
```




## Database

### GET /api/{ db }
Returns database usage statistics and limits

#### Path parameters
- **db** - Database name.

#### Example request
```http
GET /api/account1 HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer c3H8gHLk9hjf6323n8dPHzXb
```

#### Example response
```json
{
  "entities": {
    "usage": 531,
    "deleted": 85,
    "limit": 10000
  },
  "properties": {
    "usage": 7446,
    "deleted": 1547
  },
  "requests": {
    "usage": 12543,
    "limit": 100000
  },
  "files": {
    "usage": 16240263,
    "deleted": 1392158,
    "limit": 1073741824000
  },
  "dbSize": 25847392
}
```


### PUT /api/{ db }
Create new database with initial setup. Database name must be 4-12 characters, alphanumeric (can contain underscores), and cannot be a reserved name.

#### Path parameters
- **db** - Name of the database to create.

#### Request body
```json
{
  "database": "mycompany",
  "name": "John Doe",
  "email": "john@example.com",
  "types": ["document", "folder"]
}
```

**Parameters:**
- **database** (required) - Database name (4-12 characters, no reserved names)
- **name** (required) - Full name of the account owner
- **email** (required) - Email address of the account owner
- **types** (optional) - Array of entity types to include: `audiovideo`, `book`, `department`, `document`, `folder`, `lending`

#### Example response
```json
{
  "database": "mycompany",
  "person": "6798938532faaba00f8fc75f"
}
```


### GET /api/{ db }/billing
Get account billing information and Stripe portal URL

#### Path parameters
- **db** - Database name.

#### Query parameters
- **locale** - Locale for billing portal (e.g., en, et)

#### Example response
```json
{
  "billingUrl": "https://billing.stripe.com/p/session/..."
}
```




## Entity

### GET /api/{ db }/entity
Get list of entities.

#### Path parameters
- **db** - Database name.

#### Query parameters
- **q** - Search string. Will search only from searchable fields.
- **props** - Comma separated list of properties to get. If not set all properties are returned (except on group request).
- **group** - Comma separated list of properties to group by. If set, then parameters limit and skip are ignored. Will return only group's count and properties set in props parameter.
- **sort** - Comma separated list of properties to use for sorting. Use - (minus) sign before property name for descending sort. If not set sorts by \_id.
- **limit** - How many entities to return (default: 100).
- **skip** - How many entities to skip in result (default: 0).

#### Dynamic filter parameters
To filter entities by property value, use dot-separated query parameters in the format: `{property}.{type}[.{operator}]={value}`

**Supported types:**
- **string** - Text values
- **number** - Numeric values
- **boolean** - Boolean values (true/false)
- **reference** - Entity ID references
- **date** - Date values (YYYY-MM-DD)
- **datetime** - DateTime values (ISO 8601)
- **filesize** - File sizes in bytes

**Supported operators** (optional, for comparison):
- **gt** - Greater than
- **gte** - Greater than or equal to
- **lt** - Less than
- **lte** - Less than or equal to
- **ne** - Not equal to
- **in** - Match any value in comma-separated list
- **regex** - Regular expression pattern matching (format: `/pattern/flags`)
- **exists** - Check if property exists (value: `true` or `false`)

**Examples:**
- `name.string=John` - Exact string match
- `price.number.gte=100` - Numbers greater than or equal to 100
- `status.string.in=active,pending` - Match multiple values
- `title.string.regex=/^The/i` - Case-insensitive regex
- `photo.filesize.exists=true` - Has a photo
- `created.date.gte=2025-01-01` - Created after date
- `active.boolean=true` - Boolean exact match

#### Example request
```http
GET /api/account1/entity?forename.string=John&file.filesize.gte=1024&surname.string.regex=/^Apple/i&photo.string.exists=false&sort=-file.filesize&limit=12 HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

#### Example response
```json
{
  "pipeline": [
    { "$match": { "access": { "$in": ["user123", "domain", "public"] } } },
    { "$sort": { "private.file.filesize": -1 } },
    { "$skip": 0 },
    { "$limit": 12 }
  ],
  "pipelineCount": 0,
  "entities": [],
  "count": 0,
  "limit": 12,
  "skip": 0
}
```




### POST /api/{ db }/entity
Create new entity. Data must be sent as JSON list containing property object(s).

Returns created entity \_id and added properties.

For file upload, add *filename*, *filesize* and *filetype* to property parameters. Response contains *upload* object with info (url, method and headers) where to upload file (as request body).

#### Path parameters
- **db** - Database name.

#### Property object parameters
- **type** - Property type. It's mandatory parameter. Must be alphanumeric. Can contain \_, but not begin with one (except [system properties](#system-properties)).
- [ **string** \| **number** \| **boolean** \| **reference** \| **date** \| **datetime** \| **filename** \| **filesize** \| **filetype** ] - Property value.
- **language** - Optional. Language code for multilingual properties.

#### Example request
```http
POST /api/account1/entity HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Content-Type: application/json; charset=utf-8
Content-Length: 151

[
  { "type": "_type", "string": "book" },
  { "type": "title", "string": "Hobbit" },
  { "type": "photo", "filename": "cover.jpg", "filesize": 1937, "filetype": "image/jpeg" }
]
```

#### Example response
```json
{
  "_id": "bsskJkDWwQXHB8ut7vQvmWZ4",
  "properties": [
    {
      "_id": "92eVbRk2xx44n2gXsxXaxQcd",
      "type": "_type",
      "string": "book"
    },
    {
      "_id": "92eVbRk2xxFun2gXsxXaxWFk",
      "type": "title",
      "string": "Hobbit"
    },
    {
      "_id": "qXNdbysby2NHcgVDK3rrXUZk",
      "type": "photo",
      "filename": "cover.jpg",
      "filesize": 1937,
      "upload": {
        "url": "https://entu-files.s3-eu-west-1.amazonaws.com/entu/qXNdbysby2NHcgVDK3rrXUZk?",
        "method": "PUT",
        "headers": {
          "Content-Type": "image/jpeg",
          "Cache-Control": "max-age=31536000"
        }
      }
    }
  ]
}
```




### GET /api/{ db }/entity/{ _id }
Get one entity with given ID.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID.

#### Query parameters
- **props** - Comma separated list of properties to get. If not set all properties are returned.

#### Example request
```http
GET /api/account1/entity/7WgtgYnNgktpzP4jzP4jzP4j HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

#### Example response
```json
{
  "entity": {
    "_id": "7WgtgYnNgktpzP4jzP4jzP4j",
    "_type": [
      {
        "_id": "6798938432faaba00f8fc72e",
        "string": "book",
        "reference": "6798938432faaba00f8fc72e"
      }
    ],
    "title": [
      {
        "_id": "92eVbRk2xxFun2gXsxXaxWFk",
        "string": "Hobbit"
      }
    ],
    "_created": [
      {
        "_id": "92eVbRk2xx44n2gXsxXaxQcd",
        "datetime": "2025-01-28T08:21:25.637Z",
        "reference": "npfwb8fv4ku7tzpq5yjarncc",
        "string": "User 1"
      }
    ]
  }
}
```




### POST /api/{ db }/entity/{ _id }
Add new properties to existing entity.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID.

See [POST /api/{ db }/entity](#post-api-db-entity) for more info.




### DELETE /api/{ db }/entity/{ _id }
Delete entity with given ID. All entity properties are deleted too.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID.

#### Example request
```http
DELETE /api/account1/entity/7WgtgYnNgktpzP4jzP4jzP4j HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

#### Example response
```json
{
  "deleted": true
}
```




### GET /api/{ db }/entity/{ _id }/history
Get entity change history showing all property modifications over time.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID.

#### Example response
```json
[
  {
    "type": "_type",
    "at": "2025-01-28T08:21:25.637Z",
    "by": "npfwb8fv4ku7tzpq5yjarncc",
    "new": {
      "reference": "6798938432faaba00f8fc72e",
      "string": "book"
    }
  },
  {
    "type": "title",
    "at": "2025-01-28T08:21:25.637Z",
    "by": "npfwb8fv4ku7tzpq5yjarncc",
    "new": {
      "string": "Hobbit"
    }
  },
  {
    "type": "title",
    "at": "2025-01-28T10:30:00.000Z",
    "by": "npfwb8fv4ku7tzpq5yjarncc",
    "old": {
      "string": "Hobbit"
    },
    "new": {
      "string": "The Hobbit"
    }
  }
]
```




### POST /api/{ db }/entity/{ _id }/duplicate
Duplicate entity with optional property filtering and multiple copies.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID to duplicate.

#### Request body (optional)
```json
{
  "count": 1,
  "ignoredProperties": ["unique_id", "created_at"]
}
```

**Parameters:**
- **count** (optional) - Number of duplicates to create (default: 1, max: 100)
- **ignoredProperties** (optional) - Array of property types to exclude from duplication

**Note:** The following properties are automatically excluded: `_created`, `_mid`, `entu_api_key`, `entu_user`, and file properties.

#### Example response
```json
[
  {
    "_id": "newEntityId123",
    "properties": {
      "_type": [
        {
          "_id": "propId1",
          "reference": "6798938432faaba00f8fc72e",
          "string": "book"
        }
      ],
      "title": [
        {
          "_id": "propId2",
          "string": "Hobbit"
        }
      ]
    }
  }
]
```




### GET /api/{ db }/entity/{ _id }/aggregate
Trigger entity aggregation to update computed fields and search indexes. This endpoint is typically used internally after entity modifications.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID.

#### Example response
Returns the aggregation result from the MongoDB aggregation pipeline execution.




## Property

### GET /api/{ db }/property/{ _id }
Get property details or download file.

#### Path parameters
- **db** - Database name.
- **_id** - Property ID.

#### Query parameters
- **download** - If set and property is a file, redirects to file download URL.

#### Example request
```http
GET /api/account1/property/aXHYhGRaVLm2YKwzGJYqGJKa HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

#### Example response (property details)
```json
{
  "_id": "aXHYhGRaVLm2YKwzGJYqGJKa",
  "type": "title",
  "string": "Sample Title",
  "entity": "7WgtgYnNgktpzP4jzP4jzP4j",
  "created": {
    "at": "2023-01-15T10:30:00.000Z",
    "by": "user123"
  }
}
```

#### Example request (file download)
```http
GET /api/account1/property/aXHYhGRaVLm2YKwzGJYqGJKa?download=1 HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

#### Example response (file download - redirects to file URL)
```
HTTP/1.1 302 Found
Location: https://files.entu.app/...
```




### DELETE /api/{ db }/property/{ _id }
Delete property with given ID.

#### Path parameters
- **db** - Database name.
- **_id** - Property ID.

#### Example request
```http
DELETE /api/account1/property/aXHYhGRaVLm2YKwzGJYqGJKa HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

#### Example response
```json
{
  "deleted": true
}
```




## System properties

System properties begin with underscore (\_). These are special properties that control entity behavior, access rights, and metadata.

| Property | Type | Description |
| :--- | :--- | :--- |
| **\_id** | *string* | Unique ID of entity (read-only). |
| **\_type** | *reference* | Reference to entity's type definition (required). |
| **\_parent** | *reference* | Reference to parent entity. |
| **\_sharing** | *string* | Sharing level: `private`, `domain`, or `public`. |
| **\_inheritrights** | *boolean* | If true, inherits rights from parent entity. Entity-specific rights override inherited rights. |
| **\_viewer** | *reference* | Reference to users/groups who can view this entity. |
| **\_expander** | *reference* | Reference to users/groups who can add new entities under this entity. |
| **\_editor** | *reference* | Reference to users/groups who can change properties (except rights). |
| **\_owner** | *reference* | Reference to users/groups who can do anything with this entity (view, change, delete, and manage rights). |
| **\_created** | *datetime* | Entity creation timestamp (read-only). |
| **\_deleted** | *datetime* | Deletion timestamp. If set, entity is marked as deleted (read-only). |

**Access Rights Hierarchy:**
- **\_owner** - Full control (view, edit, delete, manage rights)
- **\_editor** - Can modify properties but not rights
- **\_expander** - Can create child entities
- **\_viewer** - Read-only access




## Error Responses

All API endpoints return standard error responses with the following structure:

```json
{
  "error": "Error message describing what went wrong",
  "statusCode": 400,
  "statusMessage": "Bad Request"
}
```

**Common HTTP Status Codes:**
- **400 Bad Request** - Invalid request parameters or missing required fields
- **401 Unauthorized** - Invalid or missing JWT token
- **403 Forbidden** - Insufficient permissions or no authenticated user
- **404 Not Found** - Entity, property, or resource not found
- **500 Internal Server Error** - Server-side error
