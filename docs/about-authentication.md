Authentication in Entu is tied to person entities. Each person entity in a database represents a user account and can authenticate using API keys, OAuth providers, or passkeys.

Every entity has its own access control through rights properties (`_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess`). Authenticated users can only access entities where they have explicit rights or inherited permissions.

Person entities use specific authentication properties (`entu_api_key`, `entu_user`, `entu_passkey`) to enable different authentication methods. See the **Authentication Methods** and **Authentication Properties** sections for detailed information on each approach.
