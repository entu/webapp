# Entu API Documentation

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
Create new database with initial setup

#### Path parameters
- **db** - Name of the database to create.

#### Request body
```json
{
  "database": "mycompany",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Example response
```json
{
  "created": true,
  "_id": "64a5c8e7f123456789abcdef"
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
- **limit** - How many entities to return.
- **skip** - How many entities to skip in result.

To filter entities by property value. Use dot separated list of *property key*, *data type* and *operator* as query parameter(s). Operator is optional, but must be one of following:
- **gt** - Matches values that are greater than a specified value.
- **gte** - Matches values that are greater than or equal to a specified value.
- **lt** - Matches values that are less than a specified value.
- **lte** - Matches values that are less than or equal to a specified value.
- **ne** - Matches all values that are not equal to a specified value.
- **regex** - Provides regular expression capabilities for pattern matching strings in queries.
- **exists** - Value must be true or false. When value is true, returns entities that contain the property, including entities where the property value is *null*. If value is false, the query returns only the entities that do not contain the property.

#### Example request
```http
GET /api/account1/entity?forename.string=John&file.size.gte=1024&surname.string.regex=/^Apple/i&photo._id.exists=false&sort=-file.size&limit=12 HTTP/1.1
Host: entu.app
Accept-Encoding: deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

#### Example response
```json
{
  "count": 0,
  "entities": []
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
  "_id": "7WgtgYnNgktpzP4jzP4jzP4j",
  "_type": "book",
  "title": "Hobbit"
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
  "deleted": 1
}
```




### GET /api/{ db }/entity/{ _id }/history
Get entity history.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID.

#### Example response
```json
{
  "history": [
    {
      "action": "created",
      "at": "2023-01-15T10:30:00.000Z",
      "by": {
        "_id": "user123",
        "name": "John Doe"
      }
    },
    {
      "action": "property-added",
      "at": "2023-01-15T10:35:00.000Z",
      "by": {
        "_id": "user123",
        "name": "John Doe"
      },
      "property": {
        "_id": "prop456",
        "type": "title",
        "string": "New Title"
      }
    }
  ]
}
```




### POST /api/{ db }/entity/{ _id }/duplicate
Duplicate entity with all properties.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID to duplicate.

#### Example response
```json
{
  "_id": "newEntityId123",
  "duplicated": true
}
```




### GET /api/{ db }/entity/{ _id }/aggregate
Get aggregated data for entity.

#### Path parameters
- **db** - Database name.
- **_id** - Entity ID.

#### Query parameters
- **pipeline** - MongoDB aggregation pipeline as JSON string.

#### Example response
```json
{
  "result": [
    {
      "_id": "group1",
      "count": 5,
      "total": 150
    }
  ]
}
```




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
  "deleted": 1
}
```




## System properties

System properties are read only and set by the system. Property names begin with underscore (\_).

| Property | Type | Description |
| :--- | :--- | :--- |
| **\_id** | *string* | Unique ID of entity. |
| **\_type** | *string* | Entity type. |
| **\_parent** | *reference* | A parent entity ID. |
| **\_owner** | *string* | Entity owner (user or API key). |
| **\_viewer** | *string* | Entity viewer (user or API key). |
| **\_expander** | *string* | Entity expander (user or API key). |
| **\_editor** | *string* | Entity editor (user or API key). |
| **\_public** | *boolean* | If true, then entity is public. |
| **\_sharing** | *string* | Entity sharing level. Inherits from parent by default. |
| **\_inheritrights** | *boolean* | If true, inherits rights from parent. |
| **\_deleted** | *date* | If set, entity is deleted. |
| **\_created** | *date* | Entity creation date. |
| **\_changed** | *date* | Entity modification date. |
