// Every sign-in method in display groups; `path` is both the webapp route and the API route under /auth that starts it
const providerGroups = [
  [
    { id: 'passkey', icon: 'passkey', label: 'auth-passkey', path: 'passkey', passkey: 'use' },
    { id: 'passkey-register', icon: 'passkey', label: 'auth-passkey', path: 'passkey/register', passkey: 'create' }
  ],
  [
    { id: 'apple', icon: 'apple', label: 'auth-apple', path: 'apple' },
    { id: 'google', icon: 'google', label: 'auth-google', path: 'google' },
    { id: 'e-mail', icon: 'e-mail', label: 'auth-e-mail', path: 'e-mail' }
  ],
  [
    { id: 'smart-id', icon: 'smart-id', label: 'auth-smart-id', path: 'smart-id' },
    { id: 'mobile-id', icon: 'mobile-id', label: 'auth-mobile-id', path: 'mobile-id' },
    { id: 'id-card', icon: 'id-card', label: 'auth-id-card', path: 'id-card' }
  ]
]

// The sign-in groups a page offers; its one Passkey entry goes to the sign-in page ('use') or the creation page ('create'), which also offers an existing passkey
export function authProviderGroups (passkey = 'use') {
  return providerGroups
    .map((group) => group.filter((provider) => !provider.passkey || provider.passkey === passkey))
    .filter((group) => group.length > 0)
}

// The provider a webapp /auth/... route starts, from its path segments; undefined for an unknown one
export function authProviderByPath (segments) {
  const path = [segments].flat().filter(Boolean).join('/')

  return providerGroups.flat().find((provider) => provider.path === path)
}

// The webapp routes that start a sign-in
export function authProviderRoutes () {
  return providerGroups.flat().map((provider) => `/auth/${provider.path}`)
}
