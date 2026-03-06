# Properties

Every entity is described by its **properties** — named fields that hold values. Properties are what make each entity type unique: a `person` entity has a `name` and an `email`; an `invoice` has an `amount` and a `due_date`.

Properties are defined on the entity type (as child entities of type `property`). See [Entity Types](../configuration/entity-types.md#adding-property-definitions) for how to set them up in the UI.

---

## Core Concepts

**Multi-valued** — A single property name can hold multiple values. An entity can have several tags, phone numbers, or attachments all stored under the same property name. Enable `list` on the property definition to allow this.

**Typed** — Every property has a data type (`string`, `number`, `date`, `file`, `reference`, etc.) that determines the UI input and how values are stored.

**Multilingual** — Enable `multilingual` on a property definition to store a separate value per language. A language selector appears in the edit form, and the API returns language codes alongside values.

**Computed** — Set `formula` on a property definition to compute its value automatically on every save. See [Formulas](../api/formulas.md).

**Audit trail** — All property values carry creation metadata (timestamp and user), making it traceable who set what and when.

**System properties** — Properties beginning with `_` (`_id`, `_type`, `_parent`, `_owner`, etc.) are managed by Entu and control identity, hierarchy, and access rights.

---

## Property Types

| Type | Input | Notes |
|---|---|---|
| `string` | Single-line text | Default text input. If `set` is defined on the property definition, renders as a dropdown. |
| `text` | Multi-line textarea | Auto-resizes between 3–15 rows. Enable `markdown` to allow rich formatting. |
| `number` | Number input | Locale-formatted. Use `decimals` on the property definition to control precision. |
| `boolean` | Toggle switch | Stores `true` or `false`. |
| `date` | Date picker | Stores date only — no time component. |
| `datetime` | Date + time picker | Stores a full timestamp. |
| `file` | File upload | Stores a file attachment. See [Files](../api/files.md) for the upload process. |
| `reference` | Entity selector | Links to another entity. Use `reference_query` on the definition to filter selectable options. |
| `counter` | Auto-generated code | Read-only in the UI. Shows a generate button when empty; displays the value once assigned. Use for invoice numbers, project codes. |

---

## Multi-Value Properties

When a property definition has `list: true`, the entity can hold multiple values for that property. In the edit form, extra empty inputs appear automatically as the user fills them in.

In the UI, enable `list` on the property definition and extra inputs appear automatically. Via the API, each value is a separate property object — add values by POSTing, remove specific values by DELETEing their `_id`.

---

## Multilingual Properties

When `multilingual: true` is set on a property definition, each value carries a `language` code. The edit form shows a language selector next to the input.

The edit form shows a language selector next to each input. Values for different languages are stored as separate property objects, each carrying a `language` code. See [API → Properties](../api/properties.md) for the API format.

---

## File Properties

File properties let entities store attachments, documents, images, and other binary data. Files are stored in object storage (S3-compatible) and accessed via signed, time-limited URLs.

To enable file uploads on an entity type, add a property definition with `type: file`.

---

## Computed Properties

Set `formula` on a property definition to compute its value automatically from other data — the entity's own properties, child entities, or entities that reference it. Computed properties are recalculated on every save and cannot be edited manually.

See [Formulas](../api/formulas.md) for the full syntax reference.

---

## System properties

System properties begin with underscore (_) and control entity behavior, access rights, and metadata:

| Property | Description |
|---|---|
| **_id** | Unique entity identifier (read-only, auto-generated) |
| **_type** | Reference to entity type definition (required for all entities) |
| **_parent** | Reference to parent entity (creates hierarchical relationships) |
| **_sharing** | Sharing level: `private`, `domain`, or `public` (controls visibility) |
| **_inheritrights** | Boolean. When true, inherits access rights from parent entity. Entity-specific rights override inherited rights |
| **_noaccess** | Reference to users/groups who are explicitly denied all access |
| **_viewer** | Reference to users/groups who can view entity (read-only access) |
| **_expander** | Reference to users/groups who can create child entities under this entity |
| **_editor** | Reference to users/groups who can modify properties (except rights properties) |
| **_owner** | Reference to users/groups with full control (view, edit, delete, manage rights) |
| **_created** | Creation timestamp and user (read-only, auto-generated) |
| **_deleted** | Deletion timestamp and user (read-only, set when entity is deleted) |

System properties cannot be used as custom property names.
