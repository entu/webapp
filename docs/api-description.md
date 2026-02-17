Entu is a flexible, entity-property based database system with a RESTful API. Unlike traditional relational databases with fixed table schemas, Entu uses a dynamic entity-property model where entities can have any properties defined by their type, enabling you to model complex, evolving data structures without schema migrations.

Entities represent real-world objects like people, products, or projects. Each entity has properties that store various data types including text, numbers, dates, files, and references to other entities. Entities can have multiple parents in hierarchical structures, inheriting access rights automatically. Every entity has granular access control, and users can only access entities where they have explicit or inherited permissions.

This API provides CRUD operations with filtering, sorting, grouping, full-text search, change history, and entity duplication. Built-in features include file management with signed URLs, automatic metadata tracking, and formulas for computed properties.

Authentication uses JWT tokens via API keys, OAuth providers, or WebAuthn passkeys.
