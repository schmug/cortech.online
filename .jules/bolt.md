
## 2024-XX-XX - [Safely Optimizing React Render Paths]
**Learning:** Mutating static/shared objects within a React component or hook render loop (like `useMemo` in `useAllApps`) to compute a derived `_searchable` field is a React anti-pattern and can cause strict mode errors.
**Action:** When adding pre-computed performance optimizations for static registries, compute them at module load time (in the registry file itself using helpers like `appsRaw.map(withSearchable)`) to ensure the optimized field is safely available synchronously without polluting React render cycles.
