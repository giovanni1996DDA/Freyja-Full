# CLAUDE.md - Altura20 Front

## Overview
This ERP frontend must provide a clear, fast, and reliable user experience for inventory traceability by lot, production driven by BOM and strict FIFO, OCR-assisted intake with human validation, JIT and safety stock purchasing logic, pricing via Weekly Bet, dispatch validation by exact lot, and daily operational visibility.

In this particular project, we will build the frontend of this ERP.

## Tech Stack
- React + TypeScript
- Vite
- Zustand for state management
- React Router for navigation
- Axios for HTTP communication
- Tailwind for styling approach defined by the project
- Vitest + React Testing Library for testing
- Repsonsive app, with mobile first practices
- AGGrid and AGChart for data tables and charts

## Project Structure
- `src/app/` - App bootstrap, providers, router, global styles
- `src/pages/` - Route-level pages
- `src/widgets/` - Large UI blocks composed from features/components
- `src/features/[feature-name]/` - Feature-based modules with UI, store, hooks, services, types
- `src/shared/components/` - Reusable presentational components
- `src/shared/layouts/` - App layouts such as MainLayout, AuthLayout
- `src/shared/hooks/` - Shared custom hooks
- `src/shared/lib/` - Utilities, helpers, formatters, constants
- `src/shared/services/` - HTTP client, API helpers, interceptors
- `src/shared/types/` - Global shared TypeScript types
- `src/shared/store/` - Global Zustand stores only when truly cross-feature
- `src/tests/` - Test utilities and shared test setup
- `.env` - environment variables

## Commands
- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format`

## Architecture Rules
- Use a feature-based structure, not a layer-based frontend structure
- UI text, labels, placeholders, validation messages, and code-facing naming must be in English
- Keep pages thin: pages compose features, they do not contain heavy business orchestration
- Business-oriented frontend logic lives inside feature hooks, services, mappers, and stores
- Zustand is the default state solution; do not introduce Redux or Context for app state unless there is a very small, isolated need
- Global state must be minimal; prefer local state when possible
- Server data is not the same as UI state; avoid storing every API response in Zustand unless truly needed
- Components must be small, reusable, and focused on a single responsibility
- Separate presentational components from feature orchestration when complexity grows
- All API communication must go through shared service utilities or feature services
- Route protection and authorization checks must be centralized
- Avoid coupling shared components to a specific business module

## Code Conventions

### Naming
- Components: `PascalCase`
- Hooks: `use[Something]`
- Zustand stores: `use[Entity]Store`
- Pages: `[Entity]Page`, `HomePage`, `LoginPage`
- Layouts: `[Name]Layout`
- Services: `[entity]Service`
- Types: `[Entity]`, `[Entity]Dto`, `[Entity]FormValues`
- Mappers: `[entity]Mapper`
- Constants: `UPPER_SNAKE_CASE`

### Patterns We Use
- Functional components only
- TypeScript interfaces/types for contracts
- Custom hooks for reusable UI and feature logic
- Zustand slices or isolated stores per feature when needed
- Explicit mapping between API DTOs and UI models
- Route-based code splitting when appropriate
- Controlled forms
- Error boundaries for critical UI sections when needed
- Loading, empty, error, and success states must always be handled explicitly
- User roles and user permissions are represented in a composite pattern at the UI authorization level as well

### Patterns We DON'T Use (Never Suggest)
- Class components
- Redux
- Prop drilling across many levels when composition or scoped stores solve it better
- Massive pages with inline business logic
- Direct API calls inside random UI components
- `any` as a shortcut
- Auto-generated magic abstractions that hide UI intent
- Mixed Spanish/English UI text
- Hardcoded permissions spread across the codebase

## State Management
- Use local component state for ephemeral UI concerns
- Use Zustand for cross-component or cross-page client state
- Do not put form state in global stores unless the workflow truly spans multiple screens
- Keep auth state centralized
- Keep filters, table preferences, and UI session state scoped to the relevant feature when possible
- Persist only what makes sense for UX, such as session or user preferences

## Routing and Access Control
- Use React Router with protected routes
- Authentication and authorization rules must be enforced before rendering restricted pages
- Menu visibility must depend on the authenticated user’s roles and permissions
- Permissions must drive both navigation visibility and action availability
- Do not rely only on hidden buttons for security; frontend checks are UX checks, backend remains the source of truth

## API Integration
- Use a shared HTTP client with centralized configuration
- Handle token injection centrally
- Handle common API errors in one place
- Keep request/response typing explicit
- Map backend DTOs into frontend-safe models before consumption by UI when necessary
- Never mix raw backend response shapes all over the app

## Forms and Validation
- Every form must define:
  - initial values
  - validation rules
  - submit flow
  - loading state
  - success/error feedback
- Validation messages must be clear and in English
- Disable submit actions while submitting when appropriate
- Show field-level and form-level feedback

## UI/UX Conventions
- The application must feel like an ERP: clear hierarchy, operational clarity, low ambiguity
- Prioritize readability and efficiency over decorative complexity
- Tables, filters, forms, modals, and status indicators must be reusable
- Always design for real workflows: loading, edit, cancel, confirm, retry, empty data, permission denied
- Use consistent status colors and badges across modules
- Destructive actions must require confirmation
- Lists/grids should support reusable filtering, sorting, and actions
- Avoid full-page scroll issues when a table can own its own scroll area
- Keep transitions subtle and fast

## Testing
- Unit tests: hooks, utilities, mappers, stores
- Component tests: critical UI behavior and rendering states
- Integration tests: page flows with mocked API responses
- Test naming: `[ComponentOrHook]_[Scenario]_[ExpectedResult]`
- Focus tests on behavior, not implementation details

## Git Workflow
- Branch naming: `prod/`, `dev/`, `feature/`, `fix/`
- Commit format: `type: description` (`feat`, `fix`, `refactor`, `test`, `docs`, `style`)
- Run lint and tests before committing

## Frontend Domain Conventions
- All entity IDs are `Guid` values coming from backend
- Frontend must treat backend IDs as opaque identifiers
- Dates, enums, and money values must be formatted in the UI layer, not hardcoded in raw components
- Permission-driven rendering must be centralized through helpers/hooks/components

## Shared Components We Expect
- `DataTable`
- `PageHeader`
- `SearchInput`
- `StatusBadge`
- `ConfirmDialog`
- `FormField`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `ProtectedRoute`
- `PermissionGuard`

## Final Rule
This frontend must be built for maintainability, operational clarity, and predictable behavior. Prefer simple, explicit, typed, and reusable solutions over clever abstractions.