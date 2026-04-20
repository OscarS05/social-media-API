# UUID Service Distribution Strategy

## Context

The UUID generation service needed to be placed strategically to balance code reusability (DRY principle) against future scalability. Placing it in `shared/` would eliminate code duplication across modules, but future migration to microservices would require refactoring since each microservice should have its own UUID generation logic.

## Decision

Implemented **separate UUID services per module** rather than a shared service. Each module (`auth`, `social`, etc.) contains its own UUID service instance, assuming the service implementation won't change significantly.

## Alternatives Considered

1. **Shared Service in `shared/`** (DRY approach)
   - Single service instance used across all modules
   - ✅ Eliminates code duplication, centralized maintenance
   - ❌ Requires refactoring when migrating to microservices

2. **Service per Module** (Selected)
   - Each module has its own UUID service copy
   - ✅ No refactoring needed for microservices migration
   - ❌ Violates DRY principle, code duplication

## Consequences

- **Code Duplication**: Multiple identical UUID service implementations across modules
- **Maintenance Overhead**: Changes require updates in multiple locations
- **Migration Readiness**: Eliminates future refactoring when scaling to microservices
- **Portfolio Trade-off**: Acceptable duplication for architectural flexibility

## Status

✅ **Implemented** - Version 1.0 of modular architecture
