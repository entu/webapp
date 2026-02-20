Get started with the Entu API in 5 minutes. This guide walks through authentication, creating your first entity, and querying data.

### 1. Get Your API Key

Create an API key in the Entu UI:
1. Navigate to your person entity in Entu
2. Edit it and generate an API key

Alternatively, authenticate via OAuth for temporary access.

### 2. Authenticate

Exchange your API key for a JWT token:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response includes your JWT token and database accounts:

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

### 3. Create an Entity

The `_type` property is mandatory — it references the entity type definition that determines what kind of entity you're creating.

Create a new entity with properties:

```bash
curl -X POST "https://entu.app/api/mydatabase/entity" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "type": "_type",
      "reference": "507f1f77bcf86cd799439011"
    },
    {
      "type": "name",
      "string": "My First Entity"
    },
    {
      "type": "description",
      "string": "This is a test entity created via API"
    }
  ]'
```

Response returns the created entity ID:

```json
{
  "_id": "6798938432faaba00f8fc72f",
  "properties": {
    "_type": [{ "_id": "...", "reference": "507f1f77bcf86cd799439011" }],
    "name": [{ "_id": "...", "string": "My First Entity" }],
    "description": [{ "_id": "...", "string": "This is a test entity created via API" }]
  }
}
```

### 4. Query Entities

List entities with filtering:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity?_type.reference=507f1f77bcf86cd799439011&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Search across all entities:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity?q=test&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Single Entity

Retrieve entity with all properties:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Add Properties

Add new properties to an existing entity:

```bash
curl -X POST "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "type": "status",
      "string": "active"
    },
    {
      "type": "priority",
      "number": 5
    }
  ]'
```

### 7. Upload a File

Add a file property to get upload URL:

```bash
curl -X POST "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "type": "photo",
      "filename": "image.jpg",
      "filesize": 245678,
      "filetype": "image/jpeg"
    }
  ]'
```

Response includes signed S3 upload URL. Upload your file directly to S3:

```bash
curl -X PUT "SIGNED_S3_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@image.jpg"
```

### 8. Delete a Property

Remove a specific property:

```bash
curl -X DELETE "https://entu.app/api/mydatabase/property/PROPERTY_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Common Patterns

**Filter by string value:**
```
?name.string=John
```

**Filter by number range:**
```
?price.number.gte=100&price.number.lt=500
```

**Filter by multiple values:**
```
?status.string.in=active,pending
```

**Check if property exists:**
```
?_parent.reference.exists=true
```

**Sort results:**
```
?sort=name,-created.at
```

**Limit returned properties:**
```
?props=name,description,_created
```

### Next Steps

- Review **About Entities** to understand the entity-property model
- Read **Best Practices** for optimization tips
- Explore **Formulas** for computed properties
- Learn about **Entity Rights** for access control
- Check **System Properties** for built-in property types
