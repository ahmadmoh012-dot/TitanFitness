# TitanFitness Staff Portal Frontend

Angular staff portal adapted to the current TitanFitness backend API and reorganized by feature.

## Structure

- `src/app/core` — API configuration, interceptor, transport/domain models, and backend services.
- `src/app/features` — feature-owned pages and components for dashboard, members, classes, trainers, plans, and check-in.
- `src/app/shared` — reusable portal components, pipes, and shared UI services.

Each feature keeps screen-specific components inside its own `components` folder and routable screens inside `pages`.

## Backend

The API base URL is configured in `src/app/core/config/api-endpoint.config.ts` and currently points to:

```text
https://localhost:7293/api
```

The services map the backend response shape into UI-focused records so pages are not coupled directly to controller response names.

## UI conventions

- Standalone Angular components.
- Bootstrap for layout and responsive utilities.
- Shared components for repeated controls and feedback states.
- Global custom styling only in `src/styles.css`.
- Signals for local view state.
- Feature route files lazy-loaded from `app.routes.ts`.

## Run

```bash
npm install
npm start
```

The backend must be running on the configured API URL.
