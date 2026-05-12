# Security Specification - Fox Managers

## 1. Data Invariants
- A user document must match the authentication UID.
- Only specific emails can hold the 'CEO' role.
- Saves must belong to the authenticated user who created them.
- Timestamps (createdAt) are immutable once set.
- Systems updates, Weekly Events, and HOF entries are strictly ADM/CEO writeable.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Privilege Escalation**: Attempt to set `role: 'CEO'` for a non-CEO email.
3. **Immutability Breach**: Attempt to change `createdAt` on an existing user.
4. **ID Poisoning**: Attempt to use a 2MB string as a `saveId`.
5. **Orphaned Save**: Attempt to create a save with a `userId` that doesn't match the auth UID.
6. **Cross-User Leak**: Attempt to read another user's private save.
7. **Log Tampering**: Attempt to update or delete a system log as a non-CEO.
8. **Admin Bypass**: Attempt to create a system update as a standard user.
9. **Spam Report**: Attempt to create a report without being signed in.
10. **Code Stealing**: Attempt to read all promo codes (list operation) as a non-admin.
11. **Negative XP**: Attempt to update a user with a negative XP value.
12. **Shadow Field Injection**: Attempt to inject an `isVerified` field into a user document.

## 3. Test Runner (Conceptual)
All the above payloads must return `PERMISSION_DENIED`.
For example, a user with `email: 'malicious@gmail.com'` trying to `setDoc` on `/users/uid` with `role: 'CEO'` should be blocked by:
`allow create: if isOwner(userId) && (incoming().role == 'USER' || (incoming().role == 'CEO' && isCEOEmail(incoming().email)))`
