## 2024-04-20 - Launcher App Search React Optimization
**Learning:** Hoisting repetitive string transformations outside of loops during React memoized render passes can prevent unnecessary O(N) object allocations per keystroke.
**Action:** When mapping or filtering long lists on keydown events, pre-compute lookup strings on models and transform search predicates before the loop begins.
