# Autentimine

Kõik API päringud nõuavad JWT tokenit, mis edastatakse päises `Authorization: Bearer <token>`. Tokenid kehtivad 48 tundi.

## Tokeni hankimine

Iga autentimismeetod lõpeb ühtemoodi: vaheta mandaat aadressil `GET /api/auth` JWT tokeni vastu, seejärel kasuta seda tokenit kõigis järgnevates päringutes.

### API võti

API võtmed on pikaajalised mandaadid, mis sobivad skriptide, CI/CD torujuhtmete ja server-to-server integratsioonide jaoks. Genereeri võti mis tahes objektist, millel on `entu_api_key` parameeter — tavaliselt oma isikuobjektist — seejärel vaheta see tokeniga:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

::: info
Tulemuse JWT piiramiseks ühe andmebaasiga lisa autentimispäringule `?db=mydbname`. Ka `?account=mydbname` kuju on aktsepteeritud ja toimib identselt.
:::

::: warning
Genereeritud API võti kuvatakse ainult üks kord. Kopeeri ja hoia seda turvaliselt — salvestatakse ainult räsi ja seda ei saa uuesti näidata.
:::

Objektil võib olla mitu API võtit. Kustuta üksikuid võtmeid, kui neid enam pole vaja.

### OAuth

Interaktiivsete sessioonide jaoks suuna kasutajad aadressile `/api/auth/{provider}`. Pakkuja autendib kasutaja ja tagastab ajutise tokeni. Vaheta see aadressil `GET /api/auth`:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer TEMPORARY_OAUTH_TOKEN"
```

Toetatud pakkujad: `e-mail`, `google`, `apple`, `smart-id`, `mobile-id`, `id-card`

Pakkuja tagastab kasutaja ID ja profiiliinfo, mis viiakse vastavusse objekti `entu_user` parameetriga. Esmakordsel sisselogimisel saab isikuobjekti luua automaatselt — vaata [Kasutajad → Kasutajate automaatne loomine](/et/configuration/users/#kasutajate-automaatne-loomine).

## Autentimise voog

1. Autendi OAuth-pakkuja või API võtmega
2. Vaheta mandaat aadressil `GET /api/auth` JWT tokeni vastu
3. Kasuta JWT-d päisena `Authorization: Bearer <token>` kõigis järgnevates päringutes
4. Uuenda enne 48-tunnise kehtivuse lõppu

::: warning
JWT tokenid on seotud IP-aadressiga, mida kasutati tokeni väljastamisel. Kui su IP muutub (nt võrgu vahetus, VPN või mobiilroaming), lükatakse token kohe tagasi veaga `401 Invalid JWT audience` ja sa pead uuesti autentima. Vahemällu salvesta tokenid IP-konteksti kohta, kui sinu keskkond vahetab sageli aadresse.
:::

::: tip
Vahemällu salvesta JWT ja kasuta seda uuesti päringutes. Mandaadi vahetamine iga kõne puhul on ebaotstarbekas — uuenda ainult siis, kui token aegub.
:::

## Autentimisparameetrid

Autentimisvolitused salvestatakse parameetritena objektil. Vaikimisi kasutatakse neid isikuobjektidel — iga isikuobjekt esindab inimkasutajat. Kuid samu parameetreid saab lisada mis tahes objektitüübile, mis võimaldab ka mitteinimlikutel toimijatel autentida. IoT seadistuses `robot` objekt, digitaalreklaami süsteemis `screen` objekt või tagaintegratsiooniks mõeldud `service` objekt — kõigil võib olla oma API võti ja kõik saavad iseseisvalt autentida.

### `entu_user`

- Salvestab pakkuja kasutaja ID koos muu OAuth-pakkuja tagastatud infoga (nt e-post)
- Seatakse automaatselt, kui esmakordsel sisselogimisel luuakse uus isikuobjekt

### `entu_api_key`

- Loo parameeter ilma väärtuseta — Entu genereerib automaatselt krüptograafiliselt turvalise 32-baidise võtme
- Räsi salvestatakse; tavaline võti tagastatakse ainult üks kord
- Samal objektil võib olla mitu võtit
