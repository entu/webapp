# Plugins

Plugins extend what Entu can do at the entity type level. A plugin is an entity of type `plugin`, attached to an entity type via the entity type's `plugin` property.

Create plugin entities in the Configuration area, then reference them from the entity type's `plugin` property.

---

## Plugin Categories

**UI plugins** open inside the edit drawer as an iframe tab alongside the standard edit form. Use them for custom create or edit experiences — a CSV importer, a form wizard, or an integration that pulls data from an external service. The plugin receives context as URL query parameters and renders inside Entu's own UI.

**Webhook plugins** are server-side triggers. When an entity is saved or created, Entu sends a POST request to the plugin's URL in the background without blocking the user. Use them to push data to external systems, trigger automations, sync with third-party services, or run any backend logic that should react to data changes.

---

## Plugin Parameters

| Param | Description |
|---|---|
| `name` | Display name shown as the tab label in the edit drawer (for UI plugins). |
| `type` | What kind of plugin this is — see plugin types below. |
| `url` | For UI plugins — the URL loaded in the iframe tab. For webhook plugins — the URL that receives the POST request. |
| `new_window` | Boolean. If `true`, opens the plugin URL in a new browser window instead of an iframe tab. |

---

## Plugin Types

| Type | When triggered | What happens |
|---|---|---|
| `entity-edit` | Edit drawer opened for an **existing** entity | Plugin URL loaded as an iframe tab. URL receives `account`, `entity`, `locale`, `token`. |
| `entity-add` | Edit drawer opened to **create** a new entity | Plugin URL loaded as an iframe tab. URL receives `account`, `type`, `parent` (if adding as child), `locale`, `token`. |
| `entity-edit-webhook` | An **existing** entity of this type is **saved** | Server POSTs `{ db, plugin, entity: { _id }, token }` to the plugin URL. Token is a short-lived JWT (1 min). Fire-and-forget. |
| `entity-add-webhook` | A **new** entity of this type is **created** | Same server-side POST as above, triggered on creation. |

---

## UI Plugin URL Parameters

When Entu loads a UI plugin in the iframe, it appends these query parameters to the plugin URL:

| Parameter | Description |
|---|---|
| `account` | Database identifier |
| `entity` | Entity ID (for `entity-edit`) |
| `type` | Entity type ID (for `entity-add`) |
| `parent` | Parent entity ID (for `entity-add` when creating a child) |
| `locale` | Current UI language code |
| `token` | Short-lived JWT token for making API calls on behalf of the current user |

---

## Webhook Payload

For webhook plugins (`entity-edit-webhook`, `entity-add-webhook`), Entu sends a POST request with this JSON body:

```json
{
  "db": "mydatabase",
  "plugin": "PLUGIN_ENTITY_ID",
  "entity": {
    "_id": "ENTITY_ID"
  },
  "token": "SHORT_LIVED_JWT"
}
```

The `token` is valid for 1 minute and can be used to read or modify the entity via the API. The webhook is fire-and-forget — Entu does not wait for a response or retry on failure.
