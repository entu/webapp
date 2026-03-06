# Query Reference

Entities are queried via `GET /api/{db}/entity` using URL query parameters. The same filter syntax is used in menu `query` parameters and in `reference_query` on reference property definitions.

## Filters

Filters follow the pattern `propertyName.type=value`. The type must match the property's data type.

| Filter | Example | Description |
|---|---|---|
| `prop.string=value` | `_type.string=invoice` | Exact string match |
| `prop.string.regex=/pattern/flags` | `name.string.regex=/acme/i` | Regular expression match |
| `prop.string.in=a,b,c` | `status.string.in=active,pending` | Match any of the listed values |
| `prop.string.exists=true\|false` | `email.string.exists=true` | Check whether a property has a value |
| `prop.reference=id` | `owner.reference=abc123` | Exact reference match |
| `prop.reference.in=id1,id2` | `owner.reference.in=abc,def` | Match any of the listed entity IDs |
| `prop.number=n` | `budget.number=1000` | Exact number match |
| `prop.number.gt=n` | `budget.number.gt=500` | Greater than |
| `prop.number.gte=n` | `budget.number.gte=500` | Greater than or equal |
| `prop.number.lt=n` | `budget.number.lt=1000` | Less than |
| `prop.number.lte=n` | `budget.number.lte=1000` | Less than or equal |
| `prop.number.ne=n` | `budget.number.ne=0` | Not equal |
| `prop.date=YYYY-MM-DD` | `due_date.date=2025-01-01` | Exact date match |
| `prop.date.gt=date` | `due_date.date.gt=2025-01-01` | Date comparison (also `.gte`, `.lt`, `.lte`) |
| `prop.boolean=true\|false` | `active.boolean=true` | Boolean match |

Multiple filters are combined with `&` and all must match (AND logic). There is no built-in OR between different filter keys — use `.in` to match multiple values for the same property:

```
?_type.string=project&status.string=active&owner.reference=USER_ID
```

## Sorting

Prefix the sort field with `-` for descending order.

| Parameter | Example | Description |
|---|---|---|
| `sort=prop.type` | `sort=name.string` | Sort ascending |
| `sort=-prop.type` | `sort=-date.date` | Sort descending |
| `sort=a,-b` | `sort=status.string,-date.date` | Multi-field sort |

## Pagination

| Parameter | Example | Description |
|---|---|---|
| `limit=n` | `limit=50` | Max results to return (default: 100) |
| `skip=n` | `skip=100` | Results to skip — use with `limit` for paging |

```bash
# Page 1
GET /api/db/entity?limit=100&skip=0

# Page 2
GET /api/db/entity?limit=100&skip=100
```

## Full-Text Search

```bash
GET /api/{db}/entity?q=acme+corp
```

Searches across all properties that have `search` enabled on their definition.

::: tip
Enable `search` on properties users naturally search by (name, title, code). Without it, `q=` will not find values in that field.
:::

## Field Selection

Return only specific properties to reduce response size:

```bash
GET /api/{db}/entity?props=name,status,_created
```

## Common Patterns

```bash
# All entities of a type
?_type.string=invoice

# Children of a parent
?_parent.reference=PARENT_ID

# Check if property exists
?photo.reference.exists=true

# Case-insensitive name search
?name.string.regex=/john/i

# Date range
?due_date.date.gte=2025-01-01&due_date.date.lte=2025-12-31

# Multiple statuses
?status.string.in=active,pending,review
```
