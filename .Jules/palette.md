## 2024-06-25 - Focus-within on custom wrapper inputs

**Learning:** For custom input components (like the search bars in `ProjectsApp` and `BlogApp`) that use `outline-none` on the underlying `<input>` element, it is easy to lose accessibility focus visibility.
**Action:** Always apply `focus-within` utility classes (e.g. `focus-within:border-[var(--color-amber)] focus-within:ring-1 focus-within:ring-[var(--color-amber)]`) to the parent wrapper `div` to maintain visible focus indicators when the user navigates via keyboard.
