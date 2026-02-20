When a user authenticates via OAuth for the first time, Entu can automatically create a person entity for them. This streamlines onboarding by allowing new users to access the system immediately without manual account creation.

### Requirements

For automatic user creation to occur, all of the following conditions must be met:

**1. Database Configuration**

The database entity (entity with `_type: database`) must have an `add_user` property that references the entity under which new person entities should be created as children. This defines the organizational location and inherited rights for new users.

**2. Person Entity Type**

A person entity type definition must exist in the database. This is typically an entity with `_type: entity` and `name: "person"` that defines the structure for person entities.

**3. Database Parameter**

Users must include the `db` query parameter in their authentication request, specifying which database they want to access. Without this parameter, automatic user creation does not occur.

**4. No Existing Match**

The OAuth provider's email must not match any existing person entity's `entu_user` property in that database. If a match exists, the user is authenticated as that existing person instead of creating a new one.

### Created Entity Structure

When all conditions are met, a new person entity is created with:

| Property | Value |
|---|---|
| **_type** | Reference to the person entity type |
| **_parent** | Reference from the database's `add_user` property (determines location in hierarchy) |
| **_inheritrights** | `true` — inherits access rights from the parent entity |
| **entu_user** | Email address from the OAuth provider |
| **email** | Email address from the OAuth provider |
| **name** | Display name from the OAuth provider (if available) |
| **_editor** | Self-reference allowing the person to edit their own entity |

This ensures the new user can immediately access the system with appropriate inherited rights and can manage their own profile.
