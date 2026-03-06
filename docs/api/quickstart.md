# API Quick Start

Get started with the Entu API in 5 minutes. This guide walks through authentication, creating your first entity, and querying data.

## 1. Get Your API Key

Generate an API key in the Entu UI:

1. Navigate to your person entity
2. Edit it and generate an API key

Alternatively, authenticate via OAuth for temporary access.

## 2. Authenticate

Exchange your API key for a JWT token:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "accounts": [
    {
      "_id": "mydatabase",
      "name": "mydatabase",
      "user": {
        "_id": "npfwb8fv4ku7tzpq5yjarncc",
        "name": "John Doe"
      }
    }
  ],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The JWT token is valid for 48 hours. Use it in all subsequent requests.

::: tip
Cache the JWT and reuse it across requests. Exchanging the API key on every call is wasteful — only refresh when the token expires.
:::

## 3. Create an Entity

The `_type` property is mandatory — it references the entity type that determines what kind of entity you're creating.

::: info
To find the entity type ID, query `GET /api/{db}/entity?_type.string=entity&name.string=project` or look it up in the Entu UI on the entity type's page.
:::

```bash
curl -X POST "https://entu.app/api/mydatabase/entity" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "_type", "reference": "507f1f77bcf86cd799439011" },
    { "type": "name", "string": "My First Entity" },
    { "type": "description", "string": "Created via API" }
  ]'
```

Response returns the created entity ID:

```json
{
  "_id": "6798938432faaba00f8fc72f"
}
```

## 4. Query Entities

List entities with filtering:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity?_type.reference=507f1f77bcf86cd799439011&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Full-text search:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity?q=test&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 5. Get a Single Entity

```bash
curl -X GET "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 6. Add Properties to an Entity

```bash
curl -X POST "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "status", "string": "active" },
    { "type": "priority", "number": 5 }
  ]'
```

## 7. Upload a File

Create a file property to get an upload URL:

```bash
curl -X POST "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "photo", "filename": "image.jpg", "filesize": 245678, "filetype": "image/jpeg" }
  ]'
```

The response includes a signed S3 upload URL. Upload the file directly:

::: tip
A file property named `photo` is used by the Entu UI as the entity thumbnail.
:::

```bash
curl -X PUT "SIGNED_S3_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@image.jpg"
```

## 8. Delete a Property

```bash
curl -X DELETE "https://entu.app/api/mydatabase/property/PROPERTY_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

- [Entities](../overview/entities.md) — Understand the entity-property model
- [Query Reference](./query-reference.md) — Full filter and sort syntax
- [Best Practices](./best-practices.md) — Optimization tips and patterns
- [Formulas](./formulas.md) — Computed properties
- [Files](./files.md) — File upload and download
