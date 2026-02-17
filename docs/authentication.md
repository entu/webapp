Entu supports two authentication methods:

**API key** - For programmatic access, generate API keys in Entu UI from person entities or add them directly to the entu_api_key property. Send your permanent API key to `/api/auth` to receive a JWT token (valid 48 hours).

**OAuth.ee** - For human users, use `/api/auth/{provider}` to authenticate via OAuth providers (E-mail, Google, Apple) or Estonian methods (Smart-ID, Mobile-ID, ID-card). Returns a temporary token that must be exchanged at `/api/auth` for a JWT token.

Both methods result in a JWT token used in the `Authorization: Bearer <token>` header for API requests.
