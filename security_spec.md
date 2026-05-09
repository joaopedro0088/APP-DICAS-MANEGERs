# Fox Managers Security Specification

## Data Invariants
- A `Save` must belong to a `User`.
- Only a `CEO` can publish `Logs`.
- `Roles` can only be changed by a `CEO` or `ADM` (with restrictions).
- `User` profiles can only be largely updated by the owner.

## The "Dirty Dozen" Payloads
1. User 1 trying to update User 2's role to 'CEO'.
2. User 1 trying to delete a `Save` owned by User 2.
3. User 1 trying to create a `Log` entry.
4. User 1 trying to update the global `Settings`.
5. User 1 trying to update their own `level` field.
6. A `MOD` trying to promote someone to `CEO`.
7. An unauthenticated user trying to read `Saves`.
8. User 1 trying to create a `Save` for User 2 (spoofing `userId`).
9. User 1 trying to inject a 1MB string into their `name` field.
10. A user trying to create a `Report` with a fake `reportedBy` ID.
11. A user trying to update a `Log` entry.
12. A user trying to delete another user's profile.

## The Test Runner
(I'll create a simplified version of tests or just ensure the rules cover these)
