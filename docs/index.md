---
layout: home
title: Flexible Object Database

hero:
  name: Entu
  text: Flexible Object Database
  tagline: Build your data model without code — configure entities, properties, and access rights entirely through the UI.
  image:
    src: /screenshot.jpeg
    alt: Entu
  actions:
    - theme: brand
      text: Sign Up
      link: https://entu.app/new?locale=en
    - theme: alt
      text: Documentation
      link: /overview/

features:
  - title: No-code data modelling
    details: Create entity types, properties, and relationships entirely through the UI. Change your data model at any time — no migrations, no deployments.
  - title: Starter templates
    details: Pre-configured data models for contacts, documents, library, and inventory — use as-is or adapt to your needs.
  - title: Flexible access control
    details: Four permission levels per entity — owner, editor, expander, viewer. Rights cascade automatically through parent–child relationships.
  - title: Multilingual
    details: Add translations to any field and store values per language. Users see content in their own locale; the UI adapts accordingly.
  - title: Plugins & Webhooks
    details: Embed custom UI tabs (iframes) or fire webhook triggers on any entity type — extend Entu without touching the core.
  - title: REST API
    details: Full CRUD API with JWT authentication and an interactive OpenAPI explorer at entu.app/api/docs.

pricing:
  labels:
    period: /month
    objects: objects
    storage: storage
    cta: Get Started
    vat: '* Prices do not include VAT'
  tiers:
    - plan: 1
      price: 2
      objects: '1,000'
      storage: 1 GB
      extras: []
    - plan: 2
      price: 10
      objects: '10,000'
      storage: 10 GB
      extras:
        - Daily backup
    - plan: 3
      price: 40
      objects: '100,000'
      storage: 100 GB
      extras:
        - Daily backup
        - ID authentication
      featured: true
    - plan: 4
      price: 200
      objects: '500,000'
      storage: 500 GB
      extras:
        - Daily backup
        - ID authentication
        - Priority support

partners:
  - name: Are Põhikool
    color: '#faf6ed'
    darkColor: '#242016'
  - name: August Kitzbergi nimeline Gümnaasium
    color: '#faf0f6'
    darkColor: '#231820'
  - name: Eesti Keele Instituut
    color: '#eff4fc'
    darkColor: '#181e28'
  - name: Eesti Kunstiakadeemia
    color: '#edf7f2'
    darkColor: '#182420'
  - name: Eesti Rahvusvahelise Arengukoostöö Keskus
    color: '#f4f2fc'
    darkColor: '#1e1a2e'
  - name: Okupatsioonide ja vabaduse muuseum Vabamu
    color: '#faf3ee'
    darkColor: '#241e16'
  - name: Piletilevi AS
    color: '#eef8fa'
    darkColor: '#162224'
  - name: Pillimuuseum MTÜ
    color: '#f8f0fc'
    darkColor: '#221628'
  - name: Tallinna Ehituskool
    color: '#eef8f2'
    darkColor: '#182018'
  - name: Tallinna Läänemere Gümnaasium
    color: '#faf0f0'
    darkColor: '#241818'
  - name: Toidu- ja Fermentatsioonitehnoloogia Arenduskeskus
    color: '#eef5fb'
    darkColor: '#161e26'
  - name: Vasalemma Põhikool
    color: '#fafaed'
    darkColor: '#222216'
  - name: Wõrgu Wõlurid OÜ
    color: '#f5f0fc'
    darkColor: '#1c1628'
---

## Why Entu?

Most organisations end up with a patchwork of narrow, purpose-built tools — one for contacts, another for documents, a third for assets — each rigid and expensive to change, with data siloed between them.

Entu takes a different approach: you describe your data model directly in the UI, and the system adapts to you. Entity types, properties, and relationships can be added or changed at any time, without code or migrations. Users work through a web browser; developers and external tools connect via the REST API.

## Built for the real world

Entu is already in production across a wide range of industries and use cases. Whether you're managing physical collections, running business operations, powering a custom web app, or gathering data from users — Entu adapts to the task without requiring a purpose-built system for each one:

**Libraries** — Manage book and audio-visual collections, patron records, and lending history. Track what's on the shelf, who has what, and when it's due back.

**Museums** — Catalogue artefacts and items with rich metadata, provenance, and media attachments. Structure collections into hierarchies that mirror your physical organisation.

**Business records** — Handle bookkeeping entries, supplier and customer records, and stock inventory — all in one place, without stitching together separate tools.

**Digital signage** — Store media files, configure screens and playlists, and manage playback schedules. One database drives both the content library and the display configuration.

**Web back-ends** — Drive custom web apps and portals via the REST API, with user management and access control built in. No separate admin UI needed — Entu is the admin UI.

**Data collection** — Gather applications, registrations, and survey responses directly in the Entu UI. Configure exactly what fields to capture, who can submit, and who can review — no external form tool needed.

## Pricing

<pricing-section />

## Partners & Customers

<partners-section />
