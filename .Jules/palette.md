## 2024-03-01 - Add focus visible states for inputs with `outline-none`

**Learning:** When custom input components in this application (such as those in ProjectsApp and BlogApp) use `outline-none` on the `<input>` element to hide the default browser focus ring, it creates an accessibility issue because keyboard users lose focus indication.
**Action:** When creating or modifying inputs with `outline-none`, apply `focus-within:border-[var(--color-amber)] focus-within:ring-1 focus-within:ring-[var(--color-amber)]` to the parent wrapper `div` to show a visible focus indicator. Adding `transition-shadow` makes it smooth.
