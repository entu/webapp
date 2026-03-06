# Users

Person entities represent user accounts in Entu. Each person can authenticate and is referenced throughout the system for rights assignment and ownership tracking.

---

## Adding Users

### Manual Setup

1. Create a new entity of type **Person** under your users container
2. Set `name` to their full name
3. Set `entu_user` to their OAuth email — they will be matched to this entity on next login

---

## User Rights

Assign rights to a person by referencing them in the appropriate rights property on the entities they should access:

| Property | Access |
|---|---|
| `_owner` | Full control |
| `_editor` | View and edit (not rights properties) |
| `_expander` | View and create children |
| `_viewer` | Read-only |
| `_noaccess` | Explicitly blocked, overrides inherited rights |

Use `_inheritrights: true` on a container so rights cascade to all child entities. See [Entities → Access Rights](../overview/entities.md#access-rights).

## Automatic User Creation

When a user authenticates via OAuth for the first time, Entu can automatically create a person entity for them — no manual setup required.

---

### Requirements

All of the following must be true for auto-creation to trigger:

1. The `database` entity has an `add_user` property referencing the parent entity where new person entities will be created (e.g. a "Users" folder)
2. A person entity type definition exists in the database (`_type: entity`, `name: person`)
3. The authentication request includes the `db` query parameter
4. No existing person entity already has `entu_user` matching the OAuth email

### Access Control

Because the new person entity has `_inheritrights: true` and is parented under the `add_user` target, it automatically inherits whatever rights are set on that parent. Grant rights to the parent container once — all auto-created users inherit them.

To restrict a specific user after auto-creation, add `_noaccess` directly on their person entity. Explicit rights on the child always override inherited ones.

See [Entities → Access Rights](../overview/entities.md#access-rights) for more.