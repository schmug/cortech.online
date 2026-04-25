## 2025-02-18 - App Launcher Performance Optimization
**Learning:** The app launcher's search function, `matches`, was heavily reallocating template strings and performing `.toLowerCase()` calculations on every app during every single keystroke. It could easily be avoided by pre-calculating the `.toLowerCase()` representation directly in the source data.
**Action:** Next time, identify and hoist such expensive or redundant computations (like `.toLowerCase()`) outside mapping functions, either directly on initialization if the property is mostly static or during an existing memoized hook.

## 2025-02-18 - App Launcher Optimization Rejected
**Learning:** Optimizing a string-matching search on a small set of apps (~15) by adding pre-computed search fields (`_searchable`) introduces leaky abstractions to the public `AppManifest` without solving a measurable performance issue (lowercasing short strings at this scale takes microseconds). Premature optimization violates the codebase guidelines.
**Action:** Do not over-optimize operations on small, bounded datasets. If an index is truly needed for large datasets (e.g. 1000+ items), use an external `Map`-based index rather than polluting the core data model.
