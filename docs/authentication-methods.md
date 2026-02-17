Entu supports three authentication methods, each suited for different use cases:

### API Key Authentication

For automated systems and programmatic access, person entities can have permanent API keys. These keys are long-lived credentials suitable for server-to-server communication, scripts, and integrations.

- Create an `entu_api_key` property on a person entity
- System generates a cryptographically secure 32-byte key
- Send the key to `/api/auth` to receive a JWT token (valid 48 hours)
- Best for: CI/CD pipelines, scheduled jobs, backend services

### OAuth Authentication

For human users, Entu integrates with OAuth.ee to support various authentication providers including E-mail, Google, Apple, as well as Estonian-specific methods like Smart-ID, Mobile-ID, and ID-card. This provides secure, user-friendly authentication without managing passwords.

- User authenticates via OAuth provider
- OAuth returns email that must match person entity's `entu_user` property
- Exchange temporary token for JWT at `/api/auth`
- Person entities can be created automatically on first login
- Best for: Web applications, end users, interactive sessions

### Passkey Authentication

Modern passwordless authentication using WebAuthn (FIDO2). Passkeys enable users to authenticate using biometrics, device PINs, or security keys. They're phishing-resistant, work across devices (with platform sync), and provide a seamless user experience without passwords.

- Person entities can register multiple passkeys via Entu UI
- Each passkey works across all databases
- Uses device biometrics or security keys
- No passwords to manage or forget
- Best for: Frequent users, high-security environments, password-free experience

### Authentication Flow

All authentication methods ultimately produce a JWT token:

1. Authenticate using API key, OAuth, or passkey
2. Receive temporary or permanent credential
3. Exchange credential at `/api/auth` for JWT token
4. Use JWT in `Authorization: Bearer <token>` header for all API requests
5. JWT remains valid for 48 hours
