## 2026-04-24 - Focus Visibility for Custom Input Components

**Learning:** Using `outline-none` on standard `<input>` elements removes the browser's default focus indicators, making the interface completely inaccessible to keyboard users navigating through forms or search bars. In this application, inputs are often embedded within stylized `div` wrappers (e.g., in ProjectsApp, BlogApp, and Launcher).
**Action:** Always apply `focus-within` utility classes (like `focus-within:border-[var(--color-amber)] focus-within:ring-1 focus-within:ring-[var(--color-amber)]`) to the parent wrapper of any input that uses `outline-none` to restore a highly visible, consistent focus state that matches the application's design system.
