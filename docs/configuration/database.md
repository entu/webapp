# Database

The `database` entity holds database-level settings. One is created automatically when a database is set up. Find and edit it in the Configuration area.

## Parameters

| Param | Description |
|---|---|
| `name` | Display name of the database. |
| `add_user` | Reference to a parent entity (e.g. a "Users" container). When set, any user who logs in without an existing person entity in this database will have one created automatically as a child of that parent. If not set, new logins receive no access. |

## First User

When a database is set up, the first person entity is created automatically using the name and email of the account holder. That person is granted full owner rights and becomes the initial administrator.

## Configuring User Auto-Creation

Set `add_user` to enable automatic person entity creation on first login:

1. Create a container entity (e.g. a "Users" folder) and set the desired access rights on it
2. Edit the database entity and set `add_user` to reference that container
3. Ensure a `person` entity type definition exists in the database

New users who log in via OAuth will automatically get a person entity as a child of that container, inheriting its rights.

::: warning
Auto-created users are regular authenticated users. They will see all entities shared at the `domain` level. Make sure your entity sharing settings are correct before enabling this.
:::

For person entity parameters and manual user management, see [Users](./users.md).
