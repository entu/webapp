Properties are the individual pieces of information that make up an entity. They define the attributes, relationships, and characteristics of each entity in your system. Think of properties as the fields or columns in a traditional database, but with much more flexibility and power.

Each property stores a specific piece of data - it could be a simple text value like a name, a numerical measurement, a date, a file attachment, or a reference pointing to another entity. Properties are typed, ensuring data consistency and enabling appropriate handling of different kinds of information.

### Core Concepts

**Multi-valued Properties**: Unlike traditional databases where a field holds a single value, properties in Entu can have multiple values. For example, an entity can have multiple email addresses, multiple tags, or multiple file attachments - all stored as separate property instances with the same type.

**System Properties**: Properties starting with an underscore (`_id`, `_type`, `_parent`, `_owner`, etc.) are system-managed and have special meanings. These properties control entity identity, classification, hierarchy, and access rights. They can't be arbitrarily created or modified - they're fundamental to how Entu operates.

**Custom Properties**: Beyond system properties, entities can have any number of custom properties defined by their entity type. These properties have user-defined names and types, allowing you to model your specific domain and business needs.

**Property Metadata**: Every property carries metadata about when it was created and by whom. This creates a complete audit trail of your data, allowing you to track the evolution of information over time.

**Type Safety**: Each property has a defined data type (string, number, reference, date, file, etc.) that determines what kind of value it can hold and how that value is validated, stored, and displayed. This type system ensures data integrity throughout your application.

**Computed Values**: Some properties can be defined as formulas that automatically calculate their values based on other properties. These computed properties update dynamically, providing derived insights without manual data entry.

### Property Types

Each property object requires a `type` field and exactly one value field — or all three file fields together for file uploads.

| Field | Required | Description |
|---|---|---|
| **type** | Yes | Property type name (e.g., `name`, `_type`, `description`) |
| **language** | No | Language code (e.g., `en`, `et`) for multilingual string properties |

**Value fields** — provide exactly one:

| Field | Description |
|---|---|
| **string** | Text value. Also used as display name for reference properties |
| **number** | Numeric value (integers or decimals) |
| **boolean** | Boolean value (true/false) |
| **reference** | Reference to another entity by ID. When retrieving, includes `string` field with referenced entity's display name |
| **date** | Date value in YYYY-MM-DD format |
| **datetime** | DateTime value in ISO 8601 format (e.g., "2025-01-28T08:21:25.637Z") |

**File upload** — use instead of a value field when attaching a binary file. Provide all three together:

| Field | Description |
|---|---|
| **filename** | File name |
| **filesize** | File size in bytes |
| **filetype** | MIME type (e.g., `image/jpeg`) |

### Property Naming

Property names must be alphanumeric (can include underscores), cannot start with underscore (reserved for system properties), and are case-sensitive.
