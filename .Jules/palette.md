## 2025-05-18 - Visual Affordances for OS Controls
**Learning:** MacOS-style traffic light window controls (close/minimize/maximize buttons) can be confusing for non-macOS users without hover states or clear labels. While color indicates state on macOS, relying solely on color and position is an accessibility and UX gap.
**Action:** Always add native `title` tooltips and descriptive `aria-label`s to minimalist UI controls. When a keyboard shortcut exists (like ⌘W for closing a window), explicitly surface it in the tooltip to educate users and improve power-user discoverability.
