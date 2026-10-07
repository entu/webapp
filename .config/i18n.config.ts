export default defineI18nConfig(() => ({
  datetimeFormats: {
    en: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true },
      datetimeseconds: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
    },
    et: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' },
      datetimeseconds: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
    }
  },
  // Sign-in method labels shared by every page that lists them (app/utils/auth-providers.js)
  messages: {
    en: {
      'auth-passkey': 'Passkey',
      'auth-passkey-create': 'New passkey',
      'auth-apple': 'Apple',
      'auth-google': 'Google',
      'auth-e-mail': 'E-mail',
      'auth-smart-id': 'Smart-ID',
      'auth-mobile-id': 'Mobile-ID',
      'auth-id-card': 'ID-Card'
    },
    et: {
      'auth-passkey': 'Pääsuvõti',
      'auth-passkey-create': 'Uus pääsuvõti',
      'auth-apple': 'Apple',
      'auth-google': 'Google',
      'auth-e-mail': 'E-post',
      'auth-smart-id': 'Smart-ID',
      'auth-mobile-id': 'Mobiil-ID',
      'auth-id-card': 'ID-kaart'
    }
  },
  fallbackWarn: false,
  missingWarn: false,
  legacy: false
}))
