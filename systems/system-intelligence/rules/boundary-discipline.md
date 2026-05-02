# Boundary Discipline (System Rule)

> Domain rule. How boundaries are declared and what each implies.

## Boundary kinds and their implications

| Kind | Implies |
|---|---|
| `public` | Components MUST have authentication policy declared OR a security gap is emitted |
| `private` | Components are not directly addressable from outside; access via public-boundary components |
| `trusted` | Authenticated services with elevated permissions; data and operations require strict auth |
| `untrusted` | Components handling unauthenticated input; require input validation discipline |
| `tenant-scoped` | Tenant key MUST be declared; isolation enforced; cross-tenant data access is a critical risk |

## Mutual exclusivity

A Component MAY belong to multiple boundaries (e.g., `private + tenant-scoped`). But:

- A Component cannot be both `public` and `private` (use a gateway pattern: gateway in `public`, internals in `private`).
- A Component cannot be both `trusted` and `untrusted` simultaneously; choose based on the highest-trust input it handles.

## Required policy hints

Each Boundary's `enforces` array names policy hints. Conventional values:

- `auth:bearer`, `auth:oauth2`, `auth:api-key`
- `encryption:tls`, `encryption:mtls`
- `rate-limit:per-tenant`, `rate-limit:global`
- `audit:enabled`
- `pii:redacted`, `pii:tokenized`

These hints feed risk-intelligence's risk evaluation and api-testing's auth/security analysis.
