Optimize your Entu API usage with these proven patterns and recommendations.

### Property Naming Conventions

**Use descriptive, lowercase names:**
- ✅ `product_name`, `created_date`, `customer_email`
- ❌ `pn`, `cd`, `e`

**Be consistent across entity types:**
- Use `name` for primary identifiers consistently
- Use `description` for longer text fields
- Use `photo` for images across all entity types

**Use underscores for multi-word properties:**
- ✅ `start_date`, `contact_person`, `total_price`
- ❌ `startDate`, `StartDate`, `start-date`

**Prefix related properties:**
- `address_street`, `address_city`, `address_country`
- `contact_name`, `contact_email`, `contact_phone`

### Efficient Querying

**Use specific filters instead of client-side filtering:**
```http
# Good - filter on server
GET /api/db/entity?status.string=active&_type.reference=TYPE_ID

# Avoid - fetching all and filtering client-side
GET /api/db/entity?_type.reference=TYPE_ID
```

**Limit returned properties when possible:**
```http
# Only fetch needed properties
GET /api/db/entity?props=name,status,_created&limit=100
```

**Use pagination for large datasets:**
```http
# First page
GET /api/db/entity?limit=100&skip=0

# Second page
GET /api/db/entity?limit=100&skip=100
```

**Leverage regex for flexible matching:**
```http
# Case-insensitive search
GET /api/db/entity?name.string.regex=/john/i

# Partial matches
GET /api/db/entity?email.string.regex=/@gmail\.com$/
```

**Use `.in` for multiple value filtering:**
```http
# Good - single request
GET /api/db/entity?status.string.in=active,pending,review

# Avoid - multiple requests
GET /api/db/entity?status.string=active
GET /api/db/entity?status.string=pending
```

### Access Control Patterns

**Grant minimum necessary rights:**
- Use `_viewer` for read-only access
- Use `_editor` for users who need to modify properties
- Reserve `_owner` for entity administrators

**Leverage inheritance for hierarchical permissions:**
```json
[
  {
    "type": "_parent",
    "reference": "PARENT_ENTITY_ID"
  }
]
```
Children automatically inherit rights from parents.

**Use `_sharing` for broad access:**
```json
[
  {
    "type": "_sharing",
    "string": "domain"
  }
]
```
- `domain` - All authenticated database users
- `public` - Anyone (even without authentication)

### File Upload Optimization

**Always specify correct MIME types:**
```json
{
  "type": "document",
  "filename": "report.pdf",
  "filesize": 1245678,
  "filetype": "application/pdf"
}
```

**Use appropriate property names:**
- `photo` for images/thumbnails
- `document` or `file` for documents
- `attachment` for general files

**Upload directly to S3:**
- Don't proxy files through your server
- Use the signed URL returned by Entu
- Upload expires after 15 minutes

### When to Use Aggregation

The `/api/{db}/entity/{_id}/aggregate` endpoint forces re-computation. Use it when:

**Formula values are stale:**
- External data changed that formulas depend on
- Related entities were updated
- Need fresh calculated values immediately

**Avoid for normal reads:**
- Regular GET returns cached aggregated data
- Aggregation is computationally expensive
- Cache updates automatically on entity changes

### Performance Tips

**Batch operations when possible:**
```json
// Create entity with multiple properties in one request
[
  { "type": "name", "string": "Product" },
  { "type": "price", "number": 99.99 },
  { "type": "status", "string": "active" }
]
```

**Use reference filters for related data:**
```http
# Find all products from specific manufacturer
GET /api/db/entity?manufacturer.reference=MANUFACTURER_ID
```

**Index frequently queried properties:**
- System properties like `_type`, `_parent` are already indexed
- Consider property access patterns during design

**Cache JWT tokens:**
- Tokens are valid for 48 hours
- Reuse tokens instead of requesting new ones for each operation
- Implement token refresh before expiration

### Multi-Value Properties

**Embrace multi-value by design:**
- Properties naturally support multiple values
- Add multiple values instead of creating numbered properties
- Query using `.in` to match any value

```json
// Good - multiple values
[
  { "type": "tag", "string": "urgent" },
  { "type": "tag", "string": "customer" },
  { "type": "tag", "string": "priority" }
]

// Avoid - separate properties
[
  { "type": "tag1", "string": "urgent" },
  { "type": "tag2", "string": "customer" },
  { "type": "tag3", "string": "priority" }
]
```

### Multilingual Content

**Use language parameter for translations:**
```json
[
  { "type": "name", "string": "Hello", "language": "en" },
  { "type": "name", "string": "Tere", "language": "et" },
  { "type": "name", "string": "Hei", "language": "fi" }
]
```

Properties with the same type but different `language` values allow you to store multilingual content. Filter by language client-side after retrieving the entity.

### Error Handling

**Always check status codes:**
- `401` - Refresh authentication token
- `403` - User lacks permissions, check entity rights
- `404` - Entity/property not found or no access
- `400` - Validate request body structure

**Implement retry logic:**
- Retry 5xx errors with exponential backoff
- Don't retry 4xx errors (they won't succeed)
- Maximum 3 retry attempts recommended

**Log errors with context:**
```javascript
try {
  await api.createEntity(data)
} catch (error) {
  console.error('Entity creation failed', {
    statusCode: error.statusCode,
    message: error.message,
    data: data
  })
}
```

### Data Modeling

**Design for access patterns:**
- Denormalize when read performance matters
- Use references for frequently changing data
- Consider query patterns before defining entity types

**Use formulas for derived data:**
- Calculate totals, averages, aggregations
- Reduce data duplication
- Keep source of truth in one place

**Leverage entity hierarchy:**
- Model organizational structure with parent-child
- Use for access control inheritance
- Keep related entities grouped

### Security Best Practices

**Never expose API keys:**
- Store keys in environment variables
- Don't commit keys to version control
- Rotate keys if compromised

**Validate user input:**
- Sanitize strings before creating properties
- Validate numbers are within expected ranges
- Check references point to valid entities

**Use HTTPS only:**
- All API requests must use HTTPS
- Don't allow fallback to HTTP

**Implement proper access checks:**
- Verify user has rights before operations
- Don't rely on client-side access control
- Use `_sharing` carefully for public access
