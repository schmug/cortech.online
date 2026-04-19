## 2025-02-18 - App Launcher Performance Optimization
**Learning:** The app launcher's search function, `matches`, was heavily reallocating template strings and performing `.toLowerCase()` calculations on every app during every single keystroke. It could easily be avoided by pre-calculating the `.toLowerCase()` representation directly in the source data.
**Action:** Next time, identify and hoist such expensive or redundant computations (like `.toLowerCase()`) outside mapping functions, either directly on initialization if the property is mostly static or during an existing memoized hook.
