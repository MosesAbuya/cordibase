# CRM Complete Feature & Interconnection Reference

*A detailed reference for every module, feature, and how data and logic flow between them.*

---

## Part 1: System Overview

Before diving module by module, it helps to see the whole system as a set of **core objects** that every module reads from and writes to. Almost every feature in this CRM is really just a different lens on the same underlying data graph.

### 1.1 Core Objects

| Object | What it represents | Owned primarily by |
|---|---|---|
| **Contact** | A person | Module 1 |
| **Company/Organization** | A business entity, can have subsidiaries | Module 1 |
| **Relationship Edge** | A connection between two Contacts, or a Contact and a Company (role, reporting line, influence) | Module 1 |
| **Lead** | An unqualified prospect, may or may not become a Contact | Module 1 / 4 |
| **Deal / Opportunity** | A potential sale, tied to a Pipeline stage | Module 2 |
| **Activity** | Any logged interaction — email, call, meeting, note, task | Module 3 |
| **Workflow** | An automation definition (trigger → condition → action) | Module 4 |
| **Agent Action** | A single instance of an AI agent doing or suggesting something, with an audit trail | Module 10 |
| **Campaign** | A marketing send or sequence | Module 5 |
| **Ticket** | A support/service request | Module 6 |
| **Report / Dashboard** | A saved query and its visualization | Module 7 |
| **User / Team / Role** | Who can see and do what | Module 8 |
| **Subscription / Usage Record** | Billing state and metered consumption | Module 11 |
| **Integration Connection** | A link to an external system (email, Slack, Stripe, etc.) | Module 12 |

### 1.2 Why this matters

Every module below is not really a separate "feature area" — it's a **view and a rule-set on top of this shared object graph.** A deal doesn't exist in isolation from a contact; a ticket doesn't exist in isolation from the account health score; an AI agent action doesn't exist in isolation from the workflow that could have triggered it manually instead. Understanding the interconnections is what will keep your data model from fragmenting as you build.

### 1.3 High-Level Entity Relationship Map (ASCII)

```
                     ┌─────────────┐
                     │   COMPANY    │
                     │ (Organization)│
                     └──────┬───────┘
                            │ has many
                            ▼
        ┌──────────────────────────────────┐
        │             CONTACT               │◄──────┐
        └──────┬─────────────┬──────────────┘        │
               │             │                        │ relationship edges
      linked to│             │linked to               │ (org chart, cross-org
               ▼             ▼                        │  graph)
        ┌───────────┐  ┌───────────┐                  │
        │   DEAL     │  │  TICKET   │                  │
        │(Pipeline)  │  │ (Support) │                  │
        └─────┬──────┘  └─────┬─────┘                  │
              │               │                        │
              │ generates     │ affects                │
              ▼               ▼                        │
        ┌───────────┐  ┌──────────────┐                │
        │ ACTIVITY   │  │ HEALTH SCORE │────────────────┘
        │ (timeline) │  │  (account)   │
        └─────┬──────┘  └──────┬───────┘
              │                │
              │ triggers       │ feeds
              ▼                ▼
        ┌───────────┐   ┌─────────────┐
        │ WORKFLOW   │──▶│ AGENT ACTION│
        │(automation)│   │  (AI layer) │
        └─────┬──────┘   └──────┬──────┘
              │                 │
              │ both feed       │
              ▼                 ▼
        ┌─────────────────────────────┐
        │      REPORTING / DASHBOARDS  │
        └─────────────────────────────┘

        (cutting across everything: USER/TEAM permissions,
         BILLING/usage metering, and INTEGRATIONS)
```

---

## Part 2: Module-by-Module Detail

For each module: **purpose**, **the detailed feature set**, **what it depends on (upstream)**, and **what it triggers or feeds (downstream)**.

---

### Module 1 — Contacts & Companies (Organization Management Core)

**Purpose:** The system of record for every person and organization your team interacts with. Everything else in the CRM ultimately points back here.

**Detailed features:**
- Contact record with standard fields (name, emails, phones, title, department, social profiles) plus unlimited custom fields per workspace
- Company/Organization record with firmographic fields (industry, size, revenue band, address, website, ownership structure)
- Many-to-many Contact↔Company linking with a **role** on each link (e.g. "Champion," "Economic Buyer," "Former Employee" — roles are timestamped, so history isn't lost when someone changes jobs)
- **Org-chart builder**: a visual, drag-to-connect canvas showing reporting lines inside a single company
- **Cross-organization relationship graph**: a separate graph layer connecting Contacts to each other regardless of current company (shared employment history, board memberships, referrals) — this is distinct from the org chart, which is scoped to one company
- **Account hierarchy**: parent/subsidiary linking between Company records, so a deal or ticket on a subsidiary can roll up to the parent account view
- Deduplication engine: real-time fuzzy matching on name+email+phone at entry, plus a background batch scanner for existing duplicates
- Merge tool with field-level conflict resolution (choose which record's value wins per field, or merge lists like tags/activities automatically)
- Data enrichment: scheduled and on-demand pulls from public data sources to keep firmographic fields current
- Custom objects: lets a workspace define entirely new record types beyond Contact/Company (e.g. "Property" for a real estate vertical build) that plug into the same relationship and activity system
- Tagging, saved segments/lists, and advanced filtering
- Relationship-strength indicator: a transparent, activity-count-based score (not opaque ML) shown per contact
- Import/export (CSV, API-based bulk sync)
- Field-level required/validation rules, configurable per workspace or per team

**Upstream dependencies (what Module 1 needs from elsewhere):**
- **Module 8 (Platform/Admin)** for permission checks (who can view/edit a given record) and for custom-field/custom-object schema definitions, which are managed at the admin level
- **Module 12 (Integrations)** for enrichment data sources and for email/calendar sync that populates the activity timeline shown on each Contact
- **Module 11 (Billing)** for record-count limits tied to a subscription tier (if you gate by contact volume)

**Downstream effects (what Module 1 feeds into):**
- **Module 2 (Pipeline)**: every Deal must link to a Contact and/or Company — Module 1 is the mandatory foreign key
- **Module 3 (Communication)**: the activity timeline lives conceptually "on" the Contact/Company record, even though Module 3 owns the logging logic
- **Module 4 (Automation)**: most workflow triggers fire off changes to Contact/Company fields ("when Company.industry = X, do Y")
- **Module 6 (Customer Service)**: Tickets link to Contacts, and the account health score (Module 6) is calculated partly from Contact/Company engagement data
- **Module 7 (Reporting)**: nearly every report segments by Contact or Company attributes
- **Module 10 (AI Agent Layer)**: the relationship graph is a primary input for "who else should be looped in" suggestions
- **Module 9 (Vertical Templates)**: custom objects defined here are what vertical templates pre-configure out of the box

---

### Module 2 — Sales Pipeline & Deals

**Purpose:** Tracks the lifecycle of a potential sale from open to won/lost, and models forecastable revenue.

**Detailed features:**
- Deal record: name, value, currency, stage, probability (auto-calculated from stage or manually overridden), expected close date, actual close date, owner, source
- Multiple pipelines (e.g. New Business, Renewals, per-product-line), each with independently configurable stages
- Kanban board view with drag-and-drop stage transitions, plus a sortable/filterable table view of the same data
- Products/line-items: a Deal can contain multiple line items with quantity, unit price, discount, and computed total
- Deal-to-Contact/Company linking, including multiple contacts per deal with roles (decision maker, influencer)
- Stage-based automation hooks: entering/exiting a stage can fire a Module 4 workflow
- Forecasting: weighted pipeline value (value × stage probability), rollup by owner/team/period
- Win/loss reporting with a required loss-reason field on close-lost
- **AI deal-risk scoring** with visible inputs (engagement drop, stakeholder gaps, timeline slippage — each shown as a labeled contributing factor, never a bare percentage)
- **Stall detection**: flags deals with no logged activity in a configurable window, with a suggested next action

**Upstream dependencies:**
- **Module 1** for the Contact/Company being sold to
- **Module 3** for activity data used in stall detection and engagement scoring
- **Module 4** for the workflows that stage-change triggers hook into
- **Module 10** for the AI scoring layer itself

**Downstream effects:**
- **Module 3**: every deal-stage change and note is itself a new Activity record on the timeline
- **Module 5 (Marketing)**: a closed-won deal can trigger a "customer" segment tag, moving the contact out of prospect nurture campaigns
- **Module 6**: a closed-won deal is often what creates the initial account relationship that Support later serves — the account health score blends deal history with ticket history
- **Module 7**: pipeline value, conversion rate, and forecast are the most-viewed reports in the whole product; Module 2 is their primary data source
- **Module 11**: for usage-based or outcome-based pricing components, "deal closed" can be a billable event if you ever price on outcomes
- **Module 9**: vertical templates pre-configure pipeline stages specific to an industry (e.g. a real estate pipeline vs. an agency retainer pipeline)

---

### Module 3 — Communication

**Purpose:** Captures every interaction with a Contact in one place and provides the tools to initiate new ones.

**Detailed features:**
- Two-way email sync (Gmail/Outlook), auto-logging sent and received mail against the matching Contact
- Manual and automatic call logging, with optional click-to-call via telephony integration
- Meeting scheduling with shareable booking links tied to calendar availability
- Email templates, saved snippets, and multi-step timed sequences
- SMS and WhatsApp channel support
- **AI-drafted follow-ups**: generated in a suggest-mode draft state, using deal/contact context, always requiring explicit send action from a human by default
- **Call/voice-note transcription** directly into the Activity timeline and, where relevant, into structured Deal fields
- **"Why this draft" panel**: shows exactly which activities/fields the AI used to generate a suggested message

**Upstream dependencies:**
- **Module 1** for the Contact record every communication attaches to
- **Module 2** for deal context used in AI-drafted follow-ups
- **Module 12** for the actual email/calendar/telephony provider connections
- **Module 10** for the AI drafting and transcription logic itself

**Downstream effects:**
- **Module 1**: every logged communication becomes part of the Contact's activity timeline and engagement/relationship-strength score
- **Module 2**: communication frequency feeds directly into deal stall-detection and risk scoring
- **Module 4**: inbound replies, opens, and clicks are common workflow triggers ("when email opened 3x, notify owner")
- **Module 6**: support-channel messages (if using shared inbox patterns) can auto-create or update Tickets
- **Module 7**: activity volume and response-time metrics are standard rep-performance reports

---

### Module 4 — Automation & Workflows

**Purpose:** The rules engine that connects everything else — the nervous system of the CRM.

**Detailed features:**
- Trigger types: field change, record created, stage change, time-based (e.g. "3 days after"), inbound email/form event, manual button trigger
- Condition logic: single and multi-condition (AND/OR), referencing any field on the triggering object or a related object
- Action types: create/update record, send email, create task, assign owner, post to Slack, call a webhook, invoke an AI Agent Action (Module 10)
- Visual no-code builder (trigger → condition → branch → action canvas)
- Multi-step workflows with delays and conditional branches
- **Agent action log**: every automated action — rule-based or AI-driven — is recorded with what triggered it, what data it read, and a one-click undo where applicable
- **Suggest vs. auto-act toggle**, settable per workflow, defaulting to suggest for any workflow involving an AI Agent Action
- **Natural-language workflow creation**: plain-English input parsed into a structured, human-reviewable workflow definition before activation
- Round-robin and rule-based lead/deal assignment

**Upstream dependencies:**
- Every other module, since workflows read fields from and write actions to Contacts, Companies, Deals, Tickets, Campaigns
- **Module 8** for permission scoping (who can create/edit workflows, and whose records a workflow is allowed to touch)
- **Module 10** for any step that invokes AI reasoning rather than a fixed rule

**Downstream effects:**
- This module is the **primary downstream trigger source for the entire system** — nearly every other module's "automatic" behavior is really Module 4 executing a workflow definition
- **Module 3**: automated email sends and sequences are workflow actions
- **Module 5**: campaign enrollment/removal based on CRM field changes is a workflow pattern
- **Module 6**: SLA breach alerts and auto-escalation are workflows scoped to Ticket objects
- **Module 7**: workflow execution logs are themselves reportable ("which automations actually move deals forward")
- **Module 11**: AI Agent Actions invoked by workflows are what generate usage/credit consumption in a hybrid pricing model

---

### Module 5 — Marketing

**Purpose:** Reaches contacts at scale and feeds qualified interest back into the pipeline.

**Detailed features:**
- Email campaign builder (template-based, drag-and-drop blocks)
- Web form builder: embeddable forms that create or update a Contact/Lead and can trigger a workflow on submit
- List segmentation, static and dynamic (dynamic segments auto-update as records match/unmatch criteria)
- Landing page builder
- Behavioral segmentation using engagement score rather than only static fields
- A/B testing on subject lines and content blocks
- Multi-channel campaign orchestration (email + SMS + social under one Campaign object) — later-phase feature

**Upstream dependencies:**
- **Module 1** for the contact/segment data campaigns are sent to
- **Module 4** for enrollment/removal automation and for form-submission-triggered workflows
- **Module 12** for the actual sending infrastructure (email service provider, SMS gateway)

**Downstream effects:**
- **Module 1**: form submissions create or update Contact/Lead records
- **Module 2**: campaign-sourced leads that convert become Deals, tagged with source attribution back to the originating Campaign
- **Module 7**: campaign performance (open rate, click rate, conversion-to-deal) is a standard report category, joined against Module 2 data for full-funnel attribution
- **Module 10**: engagement data generated here (opens, clicks) is an input signal for AI lead scoring

---

### Module 6 — Customer Service

**Purpose:** Manages post-sale support and keeps account health visible to the whole team, not siloed from sales.

**Detailed features:**
- Ticketing: subject, description, status, priority, assignee, linked Contact/Company
- Shared record model: a Ticket lives on the same Contact/Company timeline as sales Activity — this is a deliberate architectural choice, not just a UI convenience, since it's what differentiates this from siloed tools
- SLA tracking with breach alerts
- **Account health score**: a single visible number per Company, computed from a weighted blend of (a) support ticket volume/severity, (b) engagement recency from Module 3, and (c) billing/payment status from Module 11 — shown with its contributing factors, not as a black box
- Knowledge base / help center content, linkable from ticket replies
- CSAT survey automation (later phase)

**Upstream dependencies:**
- **Module 1** for the Contact/Company a ticket belongs to
- **Module 3** for engagement-recency data feeding the health score
- **Module 11** for billing-status data feeding the health score
- **Module 4** for SLA-breach and auto-escalation workflows

**Downstream effects:**
- **Module 1**: the health score is displayed directly on the Company record, and can itself be used as a Module 1 filter/segment field
- **Module 2**: a low health score is a strong signal to surface on renewal or upsell Deals — Module 2's AI risk scoring can optionally weight this in
- **Module 7**: support volume, resolution time, and health-score trends are their own report category
- **Module 4**: a health score crossing a threshold is a common workflow trigger ("notify account owner when health score drops below X")

---

### Module 7 — Reporting & Analytics

**Purpose:** Turns the object graph into decisions. This module doesn't own data — it queries everyone else's.

**Detailed features:**
- Standard pre-built dashboards: pipeline overview, conversion funnel, rep activity, revenue summary, support volume
- Custom report builder: choose object, fields, filters, grouping, and visualization type
- Scheduled report delivery via email
- Dashboard sharing and permissioning
- **Plain-language report queries**: natural-language input ("show me deals that stalled for 14+ days") parsed into a structured query and rendered as a chart or table
- Report annotations: team members can flag/explain anomalies directly on a chart
- Data warehouse export / reverse-ETL (later phase)

**Upstream dependencies:**
- **Literally every other module** — Module 7 is a read-only lens over Modules 1–6, 9, 10, and 11's data
- **Module 8** for permission scoping (a report should only surface data the viewer is allowed to see)
- **Module 10** for the natural-language query parsing itself

**Downstream effects:**
- Minimal — Module 7 is largely a terminal node in the data flow, though **saved reports can themselves become Module 4 workflow triggers** (e.g. "when this report's total crosses a threshold, alert the team"), which is the one place Module 7 feeds back into the system rather than just consuming from it

---

### Module 8 — Platform, Admin & Team Management

**Purpose:** Controls who can see and do what, and defines the schema every other module builds on.

**Detailed features:**
- Authentication (email/password, Google/Microsoft SSO)
- Role system: default roles (Admin, Manager, Rep) plus custom roles with granular, object-level and field-level permissions
- Multi-team/department structures
- User invite/management, audit log of user actions
- Custom field and custom object schema management (the admin-side control panel for what Module 1 exposes)
- Approval workflows (e.g. discount thresholds) — later phase
- 2FA, session management
- SSO (SAML/OIDC), SOC 2/HIPAA controls — enterprise phase

**Upstream dependencies:**
- **Module 11** for seat-count and feature-tier enforcement (what a given subscription plan allows)

**Downstream effects:**
- **Every module** depends on Module 8 for permission checks before any read/write operation
- **Module 1** depends on Module 8 for its custom-field/custom-object schema definitions
- **Module 4** depends on Module 8 to scope who can create workflows and what records a workflow is allowed to touch (important once "auto-act" AI workflows exist — this is a real security boundary, not just a UI nicety)

---

### Module 9 — Vertical Focus Layer

**Purpose:** Packages the generic system above into a pre-configured experience for one specific industry, so a new customer in that vertical gets a CRM that already matches how they work.

**Detailed features:**
- Pre-built pipeline stages (Module 2) matching the vertical's actual sales motion
- Pre-built custom fields and custom objects (Module 1) relevant to that industry
- Pre-written workflow templates (Module 4) for common vertical-specific processes
- Relevant document templates (proposals, contracts, listing sheets, etc., depending on vertical)
- Vertical-specific integrations (Module 12) — e.g. MLS data feeds for real estate, ATS sync for recruiting

**Upstream dependencies:**
- This module doesn't introduce new core logic — it's a **configuration layer that pre-populates Modules 1, 2, 4, and 12** with vertical-appropriate defaults at workspace creation time

**Downstream effects:**
- Shortens onboarding time (Module 8's setup flow) dramatically for a new customer in the target vertical, since they start from a working configuration instead of a blank schema

---

### Module 10 — AI Agent Layer

**Purpose:** The reasoning and suggestion layer that sits across Modules 1–6, always operating through Module 4's workflow/action framework so its behavior stays auditable.

**Detailed features:**
- Lead scoring (rule-based first, ML-assisted later), with visible contributing factors
- Deal-risk scoring and stall detection (feeds Module 2)
- Follow-up drafting (feeds Module 3)
- Relationship-graph suggestions — "who else should be looped in" (feeds Module 1)
- **Transparency dashboard**: a single place to review every agent action across the account — what fired, what data it used, confidence level, and outcome
- One-click undo on any agent action
- Per-user, per-workflow suggest/auto-act toggle
- Multi-step autonomous sequences (later phase, opt-in only)

**Upstream dependencies:**
- **Module 4** — every AI Agent Action is technically invoked as a Module 4 workflow action type, not a separate parallel system; this is what keeps it auditable and undoable
- Data from **Modules 1, 2, 3, and 6** as the raw signal for scoring and suggestions

**Downstream effects:**
- Feeds suggestions/actions back into **Modules 1, 2, 3, and 6** directly
- **Module 11**: every AI Agent Action that consumes model inference is a metered usage event if you're running hybrid seat+credit pricing
- **Module 7**: agent action logs are themselves a reportable data set (how often suggestions are accepted vs. dismissed — a strong signal of whether the AI is actually earning trust)

---

### Module 11 — Billing & Pricing Engine

**Purpose:** Governs what a workspace can access and meters what it consumes.

**Detailed features:**
- Seat-based subscription billing via a payment processor
- Free tier / trial logic
- Usage metering infrastructure: tracks AI Agent Actions (Module 10), record counts (Module 1), and any other consumption-based unit
- **Hybrid pricing model**: predictable seat price + transparent, published AI-credit usage on top
- In-app usage dashboard showing exactly what's being charged, in real time, not just on the invoice
- Enterprise contract/invoicing support — later phase

**Upstream dependencies:**
- **Module 10** as the primary source of metered usage events in a hybrid model
- **Module 1** for record-count-based tier limits, if applicable
- **Module 12** for the payment processor integration

**Downstream effects:**
- **Module 8**: subscription tier determines feature-gating and seat limits enforced at the permission layer
- **Module 6**: payment/billing status is one of the three inputs to the account health score
- **Module 7**: usage and revenue reporting (this is a report on the CRM's own operation, not the customer's data)

---

### Module 12 — Integrations

**Purpose:** Connects the CRM to the outside world — email providers, calendars, messaging tools, payment processors, and (via API) anything else.

**Detailed features:**
- Native integrations: email (Gmail/Outlook), calendar, Slack, Stripe
- Zapier/Make webhook-based connectivity for long-tail integrations without native build effort
- Public REST API + webhooks for customer/partner-built integrations
- Vertical-specific native integrations (paired with Module 9)
- Connection health monitoring (alerting when an integration token expires or a sync fails)

**Upstream dependencies:**
- **Module 8** for permission scoping on who can create/manage integration connections at the workspace level

**Downstream effects:**
- **Module 1**: enrichment data sources plug in here
- **Module 3**: email/calendar/telephony sync is entirely dependent on this module's connections
- **Module 5**: campaign sending infrastructure routes through here
- **Module 11**: payment processor connection lives here even though billing logic lives in Module 11

---

## Part 3: Cross-Module Interconnection Matrix

A quick-reference table: rows are the "source" module, columns show what it directly feeds into downstream. (Admin/Permissions, Reporting, and Billing are omitted as columns since nearly everything feeds them — they're called out narratively in Part 2 instead.)

| Source ↓ / Feeds Into → | Contacts (1) | Pipeline (2) | Comms (3) | Automation (4) | Marketing (5) | Service (6) | AI Layer (10) |
|---|---|---|---|---|---|---|---|
| **Contacts (1)** | — | ✔ deal owner | ✔ timeline | ✔ triggers | ✔ segments | ✔ ticket owner | ✔ graph input |
| **Pipeline (2)** | | — | ✔ deal activity | ✔ stage triggers | ✔ won→segment | ✔ health signal | ✔ risk scoring |
| **Comms (3)** | ✔ engagement score | ✔ stall detection | — | ✔ reply triggers | | ✔ shared inbox | ✔ drafting input |
| **Automation (4)** | ✔ field updates | ✔ stage automation | ✔ sequence sends | — | ✔ enrollment | ✔ SLA alerts | ✔ invokes actions |
| **Marketing (5)** | ✔ form submits | ✔ MQL→deal | | ✔ submit triggers | — | | ✔ scoring input |
| **Service (6)** | ✔ health score | ✔ renewal risk | | ✔ escalation | | — | |
| **AI Layer (10)** | ✔ suggestions | ✔ scoring | ✔ drafts | ✔ via workflows | ✔ scoring | ✔ scoring | — |

---

## Part 4: End-to-End Data Flow Narratives

Reading the matrix is useful, but seeing full lifecycles traced through the system is what actually clarifies build order and integration points.

### 4.1 "New lead to closed deal"

1. A visitor fills out a web form (**Module 5**) → creates a **Lead** and a **Contact** record (**Module 1**)
2. Form submission fires a **Module 4** workflow: assign owner via round-robin, send a welcome email (**Module 3**)
3. As the Contact engages (opens emails, visits pricing page), **Module 10**'s lead-scoring logic updates a score stored back on the Contact (**Module 1**)
4. Score crosses a threshold → **Module 4** workflow creates a **Deal** (**Module 2**) and notifies the assigned rep
5. Rep logs calls and emails (**Module 3**), all appended to the Contact's activity timeline (**Module 1**)
6. **Module 10** monitors deal activity; if it goes quiet, it flags stall risk on the Deal (**Module 2**) and suggests a follow-up draft (**Module 3**), logged in the **Module 10** transparency dashboard
7. Deal closes won → **Module 4** workflow tags the Contact as "Customer" (**Module 1**), removes them from nurture campaigns (**Module 5**), and creates the initial account relationship that **Module 6** will track going forward
8. All of the above is queryable in real time via **Module 7** dashboards, and every automated step has a corresponding log entry from **Module 4**/**Module 10**

### 4.2 "Support ticket to account health drop to renewal risk flag"

1. A customer emails support → **Module 3**/**Module 12** integration creates a **Ticket** (**Module 6**) linked to their **Contact**/**Company** (**Module 1**)
2. Ticket sits unresolved past SLA → **Module 4** workflow escalates and notifies a manager
3. **Module 6**'s health-score calculation re-runs, factoring in ticket volume/severity, drops the account's health score
4. Health score crossing a threshold is a **Module 4** trigger → notifies the account's sales/CS owner and flags any open renewal **Deal** (**Module 2**) with a risk indicator
5. **Module 10** can optionally suggest a proactive outreach draft (**Module 3**) to the account owner, citing the health-score drop as its reasoning
6. **Module 7** surfaces this account in an "at-risk accounts" dashboard alongside others matching the same pattern

### 4.3 "AI agent action, end to end, with governance"

1. A **Module 4** workflow is configured with an AI Agent Action step (e.g. "draft a follow-up when a deal stalls 7+ days") — this step is set to **suggest mode** by default
2. The trigger fires; **Module 10** reads relevant context from **Modules 1, 2, and 3** (contact role, deal stage, last three activities)
3. **Module 10** generates a draft and logs the action — what triggered it, what data it read, confidence level — in the transparency dashboard, visible to the rep and to admins
4. The rep reviews the "why this draft" panel, edits if needed, and sends via **Module 3** — or dismisses it, which is also logged and can inform future scoring
5. If a workspace admin later decides this specific workflow is trustworthy, they can flip it to **auto-act mode** (**Module 4** setting) for that workflow only — every future action still logs to the same transparency dashboard and remains one-click undoable
6. Each AI Agent Action invocation is a metered usage event recorded by **Module 11**, visible on the workspace's real-time usage dashboard

### 4.4 "New workspace onboarding in a chosen vertical"

1. A new customer signs up and selects a vertical during setup (**Module 8** onboarding flow)
2. **Module 9**'s vertical template pre-populates: pipeline stages (**Module 2**), custom fields/objects (**Module 1**), starter workflows (**Module 4**), and relevant integrations (**Module 12**)
3. The customer lands in a CRM that already matches their industry's process, rather than a blank schema — dramatically shortening time-to-value
4. As they use the product, **Module 7** dashboards and **Module 10** scoring are already relevant because the underlying fields were configured correctly from day one

---

## Part 5: Build-Order Implications of These Interconnections

A few concrete lessons fall out of tracing these flows, worth keeping in mind as you sequence engineering work:

- **Module 4 (Automation) is a hard dependency for Module 10 (AI Agent Layer)** — don't try to build AI suggestions as a bolt-on system parallel to workflows. Route every AI action through the workflow/action framework from day one, or you'll end up rebuilding the transparency/undo/audit system twice.
- **Module 1's relationship model (Contact↔Company with roles, plus the separate cross-org graph) needs to be right before you build the org-chart UI on top of it** — this is a data-model decision, not just a frontend feature, and it's expensive to migrate later.
- **Module 6's health score formula touches three other modules (3, 2/6, 11)** — build it as a scheduled recalculation job reading from those sources, not as a field manually set anywhere, or it will drift out of sync.
- **Module 7 (Reporting) should be built as a genuinely generic query layer over the object graph from the start**, even though only a few pre-built dashboards ship in Phase 1 — retrofitting a flexible report builder onto a codebase full of hardcoded dashboard queries is one of the most common expensive CRM refactors.
- **Module 11's usage metering needs to exist before Module 10's AI features ship**, even in skeleton form, or you'll have no way to bill for AI usage without a retroactive, error-prone data reconstruction.
