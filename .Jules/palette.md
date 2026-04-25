## 2026-04-24 - Focus Visibility for Custom Input Components

**Learning:** Using `outline-none` on standard `<input>` elements removes the browser's default focus indicators, making the interface completely inaccessible to keyboard users navigating through forms or search bars. In this application, inputs are often embedded within stylized `div` wrappers (e.g., in ProjectsApp, BlogApp, and Launcher).
**Action:** Always apply `focus-within` utility classes (like `focus-within:border-[var(--color-amber)] focus-within:ring-1 focus-within:ring-[var(--color-amber)]`) to the parent wrapper of any input that uses `outline-none` to restore a highly visible, consistent focus state that matches the application's design system.

## 2025-03-01 - Add Visual Feedback for Background Actions (Clipboard Write)

**Learning:** Background actions like `navigator.clipboard.writeText` are completely invisible to the user. Without explicit visual feedback, users are left wondering if the action succeeded or if they misclicked, leading to redundant clicks and uncertainty. This is especially true for custom UI components that mimic buttons but aren't native `button` elements with built-in active states, or when the action happens silently without navigating away.
**Action:** Always pair silent background actions (like copying to clipboard, saving preferences, or triggering async processes that don't block UI) with an immediate, temporary visual confirmation state (e.g., changing text to "Copied!", showing a ✅ icon, or a brief toast notification). Ensure the feedback resets after a short delay (e.g., 2 seconds) to return the component to its default state for subsequent uses.
