Entities are the fundamental building blocks of data in Entu. Think of them as individual records or objects that represent real-world things - whether that's a person, a product, a project, a document, or any other concept you need to manage.

Each entity is a container for related information, organized through properties that define its attributes and characteristics. Entities are strongly typed, meaning each entity belongs to a specific entity type that determines what kind of properties it can have.

### Key Characteristics

**Hierarchical Structure**: Entities can have parent-child relationships, creating organizational hierarchies. Child entities can have multiple parents, allowing for flexible organizational structures. Rights can be inherited from parent entities (when `_inheritrights` is set to true) or explicitly defined for each entity independently.

**Dynamic Properties**: Unlike traditional databases with fixed columns, entities have flexible property sets determined by their entity type. This means different types of entities can store completely different kinds of information while sharing the same underlying system.

**Access Control**: Every entity has specific access rights that determine who can view, edit, or manage it. These rights are controlled through properties like `_owner` (full control), `_editor` (can modify properties), `_expander` (can create children), `_viewer` (read-only access), and `_noaccess` (explicitly denied). Additionally, the `_sharing` property controls domain-wide or public access levels.

**References and Relationships**: Entities can reference other entities through reference properties, creating a rich web of interconnected data. These relationships are maintained automatically, even when entities are deleted or modified.

**Comprehensive Versioning**: All changes to entities and their properties are tracked with creation metadata, making it possible to audit who made changes and when.

