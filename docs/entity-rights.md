Entity access is controlled through rights properties. Rights can be assigned to individual users (person entities) or inherited from parent entities.

**Rights Hierarchy (from highest to lowest):**

| Property | Description |
|---|---|
| **_owner** | Full control: view, edit properties, delete entity, manage rights, create children |
| **_editor** | Can view and modify all properties except rights properties (`_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess`, `_sharing`, `_inheritrights`) |
| **_expander** | Can view entity and create child entities under it |
| **_viewer** | Read-only access to entity and its properties |
| **_noaccess** | Explicitly denied all access (overrides inherited rights) |

**Rights Inheritance:**

Set `_inheritrights: true` to inherit rights from parent entity. Child entity rights override inherited rights. For example, if parent grants _viewer rights to User A, but child explicitly denies access to User A via _noaccess, User A cannot access the child.

**Domain and Public Access:**

The `_sharing` property controls the access level:

| Value | Description |
|---|---|
| **private** | Only users with explicit rights (`_viewer`, `_editor`, `_owner`) can access |
| **domain** | All authenticated users in the database can view, but editing still requires `_editor` or `_owner` rights |
| **public** | Anyone can view without authentication, but editing still requires `_editor` or `_owner` rights |

**Multi-valued Rights:**

Rights properties can have multiple references. Entity is accessible if user matches ANY of the references in _owner, _editor, _expander, or _viewer properties.
