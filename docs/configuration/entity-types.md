# Entity Types

An entity type defines a category of objects in your database. Create one for each kind of thing you need to store — for example `project`, `invoice`, or `product`. The fields each entity carries are defined by **property definitions**, which are child entities of the entity type.

All configuration happens through the Entu UI — no code or config files.

## Creating an Entity Type

1. Open **Configuration** in the sidebar
2. Add a new entity of type **Entity**
3. Fill in the parameters below

### Entity Type Parameters

| Param | Description |
|---|---|
| `name` | Internal identifier (e.g. `project`, `invoice`). Used in API queries — lowercase, no spaces. |
| `label` | Display name shown in the UI (e.g. `Project`, `Invoice`). |
| `description` | Explanation of what this entity type represents. |
| `add_from` | Which menus or parent entity types this type can be created under. Without this, the "Add" button won't offer this type anywhere. Reference one or more menu entities here. |
| `default_parent` | When a new entity of this type is created, the referenced entity is automatically added as an additional `_parent`. Useful for routing new records into a fixed folder regardless of where the user clicked "Add". |
| `_sharing` | Maximum visibility for entities of this type: `private` (default), `domain`, or `public`. See [Entities → Sharing](../overview/entities.md#sharing). |
| `plugin` | Plugins attached to this entity type. See [Plugins](./plugins.md). |

::: warning
If `add_from` is not set, users will have no way to create entities of this type through the UI. Always reference at least one menu or entity.
:::

::: danger
Setting `_sharing: public` makes all entities of this type visible to anyone on the internet without authentication. Only use it for intentionally public content.
:::

## Adding Property Definitions

On the entity type's page, use the "Add" button to create child entities of type **Property**. Create one for each field entities of that type should have.

### Property Definition Parameters

**Identity**

| Param | Description |
|---|---|
| `name` | Internal key (e.g. `first_name`, `due_date`). Used in API queries. Must be unique within the entity type. |
| `type` | Data type — determines the UI input and how values are stored. See [Property Types](#property-types) below. |
| `label` | Display name shown above the field. |
| `label_plural` | Plural label shown when the field has multiple values (e.g. `Tags` instead of `Tag`). |
| `description` | Help text shown in an info popover next to the field label. |

**Layout**

| Param | Description |
|---|---|
| `group` | Groups related fields into named sections on the entity page and in the edit form. |
| `ordinal` | Numeric sort order within the group. Lower numbers appear first. |
| `hidden` | Hides the field from the edit form but still shows its value on the entity page. Use for formula-driven or integration-managed fields. |
| `readonly` | Visible on the entity page but not editable through the UI. |
| `table` | When set, marks this property as a column in the child list table view. |

**Behaviour**

| Param | Description |
|---|---|
| `mandatory` | Marks the field as required — always shown with a red indicator when empty. |
| `default` | Pre-filled value when creating a new entity. |
| `list` | Allows multiple values. Extra inputs appear automatically as the user fills them in. |
| `multilingual` | Stores a separate value per language. A language selector appears next to each input. |
| `formula` | A server-side expression evaluated and written on every save. See [Formulas](../api/formulas.md). |

**Type-specific**

| Param | Description |
|---|---|
| `markdown` | Enables markdown rendering for `text` type fields. |
| `decimals` | Number of decimal places for `number` type fields. |
| `set` | Restricts input to a fixed list — renders a dropdown instead of free text. Pair with `string` type. |
| `reference_query` | Filters which entities are selectable in a `reference` field (e.g. `_type.string=person`). |

**Access & discoverability**

| Param | Description |
|---|---|
| `search` | Indexes values for full-text search. Enable on fields users naturally search by. |
| `plugin` | Attaches a plugin at the field level for custom UI or behavior. |

::: tip
Enable `search` on properties users frequently filter by (e.g. `name`, `status`, `reference code`).
:::

### Property Types

| Type | Input | Notes |
|---|---|---|
| `string` | Single-line text | If `set` is defined, renders as a dropdown instead. |
| `text` | Multi-line textarea | Auto-resizes between 3–15 rows. Enable `markdown` for rich formatting. |
| `number` | Number input | Locale-formatted. Use `decimals` to control precision. |
| `boolean` | Toggle switch | Stores true/false. |
| `date` | Date picker | Stores date only — no time component. |
| `datetime` | Date + time picker | Stores a full timestamp. |
| `file` | File upload | Stores a file attachment. See [Files](../api/files.md). |
| `reference` | Entity selector | Links to another entity. Use `reference_query` to filter selectable options. |
| `counter` | Auto-generated code | Read-only. Shows a generate button when empty; displays the value once assigned. Use for invoice numbers, project codes. |

## Property Visibility

Each property value inherits its visibility from the entity it belongs to. By default, if an entity is `private`, all its properties are private as well.

You can make a specific property more visible by setting `_sharing` on its property definition — but it can never exceed the `_sharing` level set on the entity type. This lets you expose selected fields (e.g. a public `name` or `photo`) while keeping the rest of the entity restricted.

| Entity type `_sharing` | Allowed values for property `_sharing` |
|---|---|
| `private` | `private`, `domain`, `public` |
| `domain` | `domain`, `public` |
| `public` | `public` |

::: tip
For a full worked example of an entity type with properties, see [Use-Case Examples](../examples.md).
:::
