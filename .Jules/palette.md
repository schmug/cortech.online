## 2024-05-18 - Custom Search Inputs Focus State
**Learning:** The custom search inputs in apps like `ProjectsApp` and `BlogApp` have `outline-none` on the actual `<input>` elements. Since they are wrapped in `div`s styled to look like the input box, keyboard users lose visual focus indication when navigating to these search fields.
**Action:** Use the `focus-within:` pseudo-class on the parent wrapper `div` to apply border colors and focus rings whenever the child input receives focus. This restores accessible keyboard navigation while keeping the custom UI styling.
