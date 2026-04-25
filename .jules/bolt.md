## 2024-04-20 - Launcher App Search React Optimization Rejected
**Learning:** Premature optimization for small lists (~15 items) by hoisting string transformations is unnecessary and can introduce leaky abstractions. The cost of lowercasing short strings per keystroke at this scale is negligible (microseconds).
**Action:** Do not add abstractions (like a `_searchable` field on a public type) or complex logic for micro-optimizations without a measured performance bottleneck. Follow CLAUDE.md: "Don't add features, refactor, or introduce abstractions beyond what the task requires."
