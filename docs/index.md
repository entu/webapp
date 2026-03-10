---
layout: home

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

Every organization — company, institution, school, or non-profit — creates data that needs to be organized, stored, and shared. The usual answer is a collection of narrow, purpose-built systems: one for contacts, another for documents, a third for assets. Each is rigid and expensive to change. Connecting them requires custom integrations. Moving data between them is often done by hand.

Entu takes a different approach. Instead of fitting your work into a fixed system, you describe your data in Entu — what types of objects exist, what properties they have, how they relate to each other — and the system adapts to you. Object types, properties, and relationships can be added or changed at any time, without code or migrations.

The result is a single platform where all your information lives together. Users access it through a web browser from any device. Developers and external tools connect through the REST API. And because everything is in one place, there is no need to build integrations between separate systems or move data manually between them.

## Pricing

<pricing-section />

## Partners & Customers

<partners-section />
