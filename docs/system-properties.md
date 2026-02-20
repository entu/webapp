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
