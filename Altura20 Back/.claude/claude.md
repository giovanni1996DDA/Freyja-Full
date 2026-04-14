# CLAUDE.md - Altura20 Back

## Overview
This ERP must support inventory traceability by lot, production driven by BOM and strict FIFO, OCR-assisted intake with human validation, JIT and safety stock purchasing logic, pricing via Weekly Bet, dispatch validation by exact lot, and daily immutable legal backup. In this particular project, we will build the backend of this ERP.

## Tech Stack
- .NET 10, ASP.NET Core Minimal APIs
- Entity Framework Core 10 with PostgreSQL
- FluentValidation for request validation
- Scalar for OpenAPI documentation
- xUnit + FluentAssertions for testing

## Project Structure
- `src/Api/` - Endpoints, middleware, DI configuration
- `src/Application/` - General application logic, use cases coordinations
- `src/Application/Features/[EntityName]/` - Commands, queries, handlers, validators, DTOs, Mappings
- `src/Domain/` - Entities, value objects, enums, domain events, business logic
- `src/Infrastructure/` - EF Core, external services, repositories, interfaces implementations
- `tests/UnitTests/` - Domain and application layer tests
- `tests/IntegrationTests/` - API and database tests

## Commands
- Build: `dotnet build`
- Test: `dotnet test`
- Run API: `dotnet run --project src/Api`
<!-- - Add Migration: `dotnet ef migrations add <Name> -p src/Infrastructure -s src/Api` -->
- Update Database: `dotnet ef database update -p src/Infrastructure -s src/Api`
- Format: `dotnet format`

## Architecture Rules
- Domain layer has ZERO external dependencies
- Application layer defines interfaces, Infrastructure implements them
- All database access goes through EF Core DbContext (no repository pattern)
- Use Mediator for all command/query handling
- API layer is thin - endpoint definitions only

## Code Conventions

### Naming
- Commands: `Create[Entity]Command`, `Update[Entity]Command`
- Queries: `Get[Entity]Query`, `List[Entities]Query`
- Handlers: `[Command/Query]Handler`
- DTOs: `[Entity]Dto`, `Create[Entity]Request`

### Patterns We Use
- Primary constructors for DI
- Records for DTOs and commands
- Result<T> pattern for error handling (no exceptions for flow control)
- File-scoped namespaces
- Always pass CancellationToken to async methods
- User roles and user permissions are in a composite pattern

### Patterns We DON'T Use (Never Suggest)
- Repository pattern (use EF Core directly)
- AutoMapper (write explicit mappings)
- Exceptions for business logic errors
- Stored procedures

## Validation
- All request validation in FluentValidation validators
- Validators auto-registered via assembly scanning
- Validation runs in Mediator pipeline behavior

## Testing
- Unit tests: Domain logic and handlers
- Integration tests: Full API endpoint testing with WebApplicationFactory
- Use FluentAssertions for readable assertions
- Test naming: `[Method]_[Scenario]_[ExpectedResult]`

## Git Workflow
- Branch naming: `prod/`, `dev/`
- Commit format: `type: description` (feat, fix, refactor, test, docs)
- Run tests before committing

## Domain Conventions
- All primary keys are the Entities ID.
- All entities must have their primary ID's as Guid.

## Use Cases by Module

### UC-01 — Configure Roles and Permissions
**Need**: the ERP requires strict RBAC before productive use.
**What it does**: allows management/administrators to define base roles, assign module/action permissions, and configure Supervisor PIN-based overrides.

### UC-02 — Import Historical Data
**Need**: the system must start with usable historical data from Excel, Google Sheets, and QuickBooks CSV exports.
**What it does**: ingests, cleans, maps, validates, and imports historical records through controlled onboarding templates.

### UC-03 — Manage Article Group
**Need**: products must be organized by generic families before specific SKUs can exist.
**What it does**: creates and maintains article families such as Onion or Pea.

### UC-04 — Manage Specific Article
**Need**: operational processes require concrete SKUs, not just generic groups.
**What it does**: creates and maintains the specific article, including brand, commercial presentation, category, and operational identity.

### UC-05 — Configure Article-Specific UoM Conversion
**Need**: packaging equivalence varies by specific article.
**What it does**: defines parent unit, child unit, base unit, and exact conversion values per article.

### UC-06 — Configure Article Stock Policy
**Need**: each article must behave either as replenished stock or as JIT/on-demand supply.
**What it does**: defines whether the article uses safety stock or JIT policy, and stores minimum stock/reorder point where applicable.

### UC-07 — Register Inventory Intake from Invoice
**Need**: incoming goods must enter inventory with validated article, quantity, conversion, and lot traceability.
**What it does**: scans or uploads invoice, uses OCR, sends data to quarantine, requires human validation against physical goods, applies UoM conversion, creates the lot, and updates balances.

### UC-08 — Query Lot and Article Balances
**Need**: users must verify existence, availability, and traceability.
**What it does**: shows balances by lot, status, date, and consolidated equivalent stock by specific article.

### UC-09 — Change Lot Status
**Need**: lots sometimes must be blocked, released, or depleted for quality and operational reasons.
**What it does**: lets a Supervisor move a lot between `Available`, `Hold/Quarantine`, and `Depleted`, with reason and audit.

### UC-10 — Register Losses or Waste
**Need**: every loss must be attributable to a specific lot for auditability.
**What it does**: records discarded quantity, reason, and updates the corresponding lot balance while preserving immutable loss history.

### UC-11 — Execute Cycle Count
**Need**: physical inventory counts must reconcile real stock with theoretical stock.
**What it does**: captures counted quantities, compares them with system values, applies adjustments, and generates audit trace.

### UC-12 — Manage Master BOM
**Need**: production needs a formal recipe with inputs, conversions, expected waste, and expected yield.
**What it does**: creates and maintains the active BOM used by production orders.

### UC-13 — Start Production Order / Run
**Need**: the system must open a controlled production process based on an active BOM.
**What it does**: creates a production run, calculates theoretical requirements, and opens the operation for input/output registration.

### UC-14 — Assign Raw Material by Strict FIFO
**Need**: production traceability requires oldest valid lot consumption first.
**What it does**: calculates required raw material, finds available lots, orders them by age, and assigns consumption following strict FIFO.

### UC-15 — Declare Production Input (WIP)
**Need**: the system must know the exact raw material actually withdrawn for the production run.
**What it does**: records real lot-based consumption and consolidates the effective WIP input.

### UC-16 — Resolve Ghost Lot with Override
**Need**: the suggested FIFO lot may not physically exist even if the system says it does.
**What it does**: allows a Supervisor to authorize a PIN override, send the missing lot balance to loss/zero, and release the next valid FIFO lot.

### UC-17 — Declare Production Output
**Need**: finished goods must be recorded with yield validation and traceable final lot creation.
**What it does**: captures final quantity/weight, compares it against BOM expectations, creates the finished-good Julian lot, and registers finished stock.

### UC-18 — Authorize Production Tolerance Deviation
**Need**: abnormal yield or waste must not be accepted silently.
**What it does**: blocks output confirmation when deviation is illogical, then allows Supervisor approval or rejection via PIN and reason.

### UC-19 — Register Extra Product from Better Yield
**Need**: when actual yield exceeds theoretical yield, the system must preserve traceability without double-consuming raw material.
**What it does**: detects usable extra output, creates an additional finished-good lot with expiry date, and records the stock without debiting raw material again.

### UC-20 — Query JIT Purchase Suggestions
**Need**: demand-driven special products require urgent procurement suggestions only when actual demand exists.
**What it does**: analyzes incoming demand for JIT articles and produces an urgent replenishment list.

### UC-21 — Query Replenishment Suggestions
**Need**: safety-stock articles must be replenished when total stock falls below minimum.
**What it does**: compares total equivalent stock against configured minimums and generates automatic replenishment suggestions.

### UC-22 — Capture Customer Order / PO via OCR
**Need**: customer orders arriving as PDFs or images must be digitized quickly but safely.
**What it does**: extracts customer, items, and quantities through OCR, structures the information, and sends the order to visual quarantine.

### UC-23 — Approve Order in Quarantine Tray
**Need**: OCR-captured orders must be manually validated before becoming operational.
**What it does**: lets a Supervisor review, correct, approve, or reject an order before it becomes available for billing, picking, or procurement.

### UC-24 — Manage Weekly Bet Matrix
**Need**: pricing is fixed weekly per customer and must be versioned.
**What it does**: defines and maintains weekly customer/article pricing with validity windows and historical versioning.

### UC-25 — Issue Receipt/Invoice Freezing Historical Cost
**Need**: profitability analysis requires preserving price and cost as they were at the time of the sale.
**What it does**: retrieves the active Weekly Bet price, freezes historical cost and price, and issues the commercial document.

### UC-26 — Print Finished Product Label
**Need**: every finished-good lot requires an official label for storage and dispatch.
**What it does**: prints the label including SKU, Julian lot, and expiry date, and records the print event.

### UC-27 — Reprint Label with Audit
**Need**: damaged or lost labels must be reissued without losing traceability.
**What it does**: allows authorized reprint, storing user, timestamp, and reason.

### UC-28 — Plan Dispatch Routes
**Need**: dispatches must be sequenced efficiently while supporting operational overrides.
**What it does**: proposes optimized routes, lets logistics force stop order or time windows, and confirms the final route plan.

### UC-29 — Validate Pick & Pack
**Need**: dispatch traceability requires the exact committed finished-good lot to be loaded.
**What it does**: displays expected lots, validates scanned/confirmed lot, blocks mismatches, and records the loading event.

### UC-30 — Confirm Delivery at Destination (POD)
**Need**: the business requires proof of delivery for each shipment.
**What it does**: allows the driver to confirm arrival, record delivery, attach evidence if needed, and mark the order as delivered or incidented.

### UC-31 — Execute Daily Logistics Closure
**Need**: the operation must be cut and preserved automatically every day.
**What it does**: at midnight, the scheduler starts the daily closure process and prepares consolidation of all relevant transactions.

### UC-32 — Consolidate Daily Movements
**Need**: the legal backup must include the full operational trace of the day.
**What it does**: collects all daily receipts, hold/quarantine changes, ghost lots, production inputs/outputs, losses, supervisor overrides, and confirmed dispatches into one consolidated set.

### UC-33 — Generate and Send Daily Ledger
**Need**: the company needs immutable legal defense for food safety and operational audits.
**What it does**: generates the daily immutable file, applies timestamping, sends it to the private cloud, and records transmission result.

### UC-34 — Query Executive Dashboard
**Need**: management requires a consolidated operational and financial view.
**What it does**: crosses dispatched volume with real raw-material cost and Weekly Bet pricing, then shows KPIs, deviations, and trends.
