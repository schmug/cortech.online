## 2024-04-18 - [Optimizing UI Rendering Constraints]
**Learning:** Prematurely adding performance optimizations like pre-computed searchable fields to a small array (e.g. 15 App Manifests) creates unnecessary "leaky" abstractions on public types (`AppManifest`) and maintenance overhead for zero measurable impact.
**Action:** Do not implement search or filtering optimizations unless scaling to hundreds or thousands of elements, and even then prefer encapsulated approaches like an internal `Map` over polluting domain types.
