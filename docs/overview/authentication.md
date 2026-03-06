# Authentication

Authentication in Entu is tied to **person entities**. Each person entity represents a user account and can authenticate using one or more methods. All methods produce a JWT token used in the `Authorization: Bearer <token>` header for every API request. Tokens are valid for 48 hours.

## OAuth

For human users. Entu redirects to an external identity provider for secure, password-free login.

**Supported providers:** `e-mail`, `google`, `apple`, `smart-id`, `mobile-id`, `id-card`

- User authenticates via `/api/auth/{provider}`
- The provider returns an email matched against the person entity's `entu_user` property
- Exchange the temporary token at `GET /api/auth` for a 48-hour JWT
- On first login, a person entity can be created automatically — see [Users → Automatic User Creation](../configuration/users.md#automatic-user-creation)

**Best for:** Web applications, end users, interactive sessions.

## Passkey (WebAuthn)

Passwordless authentication using device-bound credentials — Face ID, Touch ID, hardware security keys. Phishing-resistant and syncs across devices.

- Register passkeys in the Entu UI on your person entity
- Each passkey covers all databases
- Login is a two-step challenge/response flow handled by the browser's WebAuthn API
- A person entity can have multiple passkeys (one per device)

**Best for:** Frequent users, high-security environments, password-free experience.

## API Key

For programmatic and service access. Long-lived credentials suitable for server-to-server communication, scripts, and integrations.

- Generate a key by editing your person entity in the Entu UI, or create an `entu_api_key` property via the API with no value — Entu generates the key
- Exchange the key at `GET /api/auth` to receive a JWT token
- A person entity can have multiple API keys

::: warning
The generated API key is displayed only once. Copy and store it securely before closing — only its hash is stored and it cannot be retrieved again.
:::

**Best for:** CI/CD pipelines, scheduled jobs, backend services, integrations.

## Authentication Flow

All three methods converge to the same result:

1. Authenticate using your OAuth provider, passkey, or API key
2. Exchange the credential at `GET /api/auth` for a JWT token
3. Use the JWT in `Authorization: Bearer <token>` on all subsequent requests
4. Refresh before the 48-hour expiry

## Person Authentication Properties

Three properties on the person entity store authentication credentials:

### `entu_user`

- Stores the email address returned by the OAuth provider
- On login, the OAuth email must match this property's value exactly
- Set automatically when a new person entity is created on first login

### `entu_passkey`

- Stores the credential ID, public key, usage counter, and device name
- Multiple passkeys can be registered per person entity
- Must be registered through the Entu UI on your own person entity

### `entu_api_key`

- Create the property with no value — Entu auto-generates a cryptographically secure 32-byte key
- The hash is stored; the plain key is returned only once
- Multiple keys can exist on the same person entity
