# Database Migration Checklist

- **Migration Name:** _Timestamp_description_
- **Author:** _Name_
- **Date:** _YYYY-MM-DD_

## Pre-Migration
- [ ] Migration reviewed with DBA/data owner.
- [ ] Backfill or data correction scripts prepared and tested.
- [ ] Rollback/undo strategy defined (down migration, restore point).
- [ ] Performance impact assessed (indexes, locks, long-running queries).
- [ ] Feature flag strategy defined for dependent application changes.

## Implementation
- [ ] Migration scripts idempotent and safe for retry.
- [ ] Uses transactional DDL where supported; otherwise documents lock expectations.
- [ ] Handles large tables with batched updates to avoid downtime.
- [ ] Includes comments describing purpose and linked tickets.
- [ ] Schema changes reflected in ORM/models and documentation.

## Testing
- [ ] Applied to local/dev environment successfully.
- [ ] Applied to staging with production-like data snapshot.
- [ ] Automated tests updated for new schema behavior.
- [ ] Load/performance tests run if query plans change.

## Deployment
- [ ] Scheduled during low-traffic window if necessary.
- [ ] Monitoring set up for replication lag, errors, or slow queries.
- [ ] On-call engineer informed with runbook.
- [ ] Verification queries defined to confirm success.

## Post-Deployment
- [ ] Clean up feature flags, temporary tables, or scripts.
- [ ] Update data catalog/lineage documentation.
- [ ] Record lessons learned for future migrations.

## Revision History
| Date | Author | Summary |
| --- | --- | --- |
| _YYYY-MM-DD_ | _Name_ | _Initial draft_ |
