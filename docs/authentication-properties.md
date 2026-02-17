Person entities use specific properties to enable authentication:

### entu_api_key

Permanent API key for programmatic access. This property enables machine-to-machine authentication:
- Create a property with type `entu_api_key` on a person entity (don't provide a value)
- The system automatically generates a cryptographically secure random 32-byte key
- The hash of this key is stored in the database for secure verification
- The plain-text key is returned once in the API response - you must save it immediately as it cannot be retrieved later
- Multiple API keys can be created for the same person entity (multi-valued property)
- Each key provides full access rights as that person entity
- To authenticate, send the API key to `/api/auth` to receive a JWT token

### entu_user

OAuth email identifier that links a person entity to OAuth authentication:
- Stores the email address associated with the OAuth account
- Used by the system to locate the correct person entity during OAuth login
- When a user authenticates via OAuth, the returned email from the OAuth provider must match this property value
- This property may be automatically created when a new person entity is generated during first login
- Enables consistent user identification across multiple OAuth sessions

### entu_passkey

WebAuthn passkey credential for passwordless authentication. Each property stores one registered device/authenticator:
- Contains the credential ID, public key, usage counter, and device name
- Multiple passkeys can be registered per person entity (multi-valued property)
- Each passkey provides full access rights as that person entity across all databases
- Passkeys must be created through the Entu UI by editing your own person entity
- Users can only add passkeys to their own person entity, not to others
