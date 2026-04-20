# Polymorphic Likes Implementation

## Context

Supporting likes across multiple entity types (posts and comments, but they could be more like stories or messages) requires a database design strategy. Production systems could typically use separate tables per likeable type to optimize query performance and data distribution across scale, but this introduces maintenance overhead and table proliferation for a portfolio project.

## Decision

Implemented a single **polymorphic likes table** supporting multiple entity types via type discriminators instead of creating separate tables per likeable entity.

Structure:

- `likes` table with columns: `id`, `userId`, `likeable_Type` (post|comment), `likeable_id`, `createdAt`
- Type-safe queries filtered by `likeable_Type` and `likeable_id`

## Alternatives Considered

1. **Polymorphic Table** (Selected)
   - Single table for all like types
   - ✅ Simpler maintenance, flexible for portfolio
   - ❌ Scalability issues, no direct foreign keys, query complexity

2. **Separate Tables per Type** (Production ideal)
   - `likes_posts`, `likes_comments`, `likes_stories`, etc.
   - ✅ Optimized queries, natural foreign keys, scales better
   - ❌ Over-engineered for portfolio

## Consequences

- **Scalability Trade-off**: High-scale scenarios require refactoring (costly)
- **Database Constraints**: No direct foreign key relationships to multiple tables
- **Query Complexity**: Additional filtering logic required in backend queries
- **Maintainability**: Adds abstraction layer requiring careful type handling

Future migration to separate tables would be complex yet possible with careful data migration strategy.

## Status

✅ **Implemented** - Sufficient for portfolio scope
