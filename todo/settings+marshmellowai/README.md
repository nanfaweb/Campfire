# CampFire — Next.js Design Files

Converted from HTML mockups to Next.js App Router structure.

## File Structure

```
app/
├── globals.css              # All custom CSS, Material Symbols, design utilities
├── layout.tsx               # Root layout — wraps every page with Sidebar + MobileNav
├── settings/
│   └── page.tsx             # Settings → Appearance screen
└── marshmallow/
    ├── page.tsx             # Route entry (server component)
    └── MarshmallowClient.tsx # Interactive chat UI (client component)

components/
├── Sidebar.tsx              # Desktop left nav (active state via usePathname)
├── TopNav.tsx               # Mobile top header
└── MobileNav.tsx            # Mobile bottom tab bar

tailwind.config.ts           # Full CampFire design token system
```

## Setup

1. Install fonts in your `layout.tsx` (or via `next/font/google`):
   - **Space Grotesk** — headings, labels, nav
   - **Be Vietnam Pro** — body text

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure `globals.css` is imported in the root `layout.tsx`.

4. The Marshmallow chat page has basic local state. Wire up your AI API in
   `MarshmallowClient.tsx` inside the `sendMessage` function.

## Design Tokens

All color tokens live in both `tailwind.config.ts` and as CSS custom properties
in `globals.css`. Key tokens:

| Token            | Value     | Usage                    |
|------------------|-----------|--------------------------|
| `primary`        | `#802a00` | CTA buttons, active nav  |
| `primary-orange` | `#ff6b2b` | Headings, accents, icons |
| `accent-pink`    | `#ff3cac` | Hover states, gradients  |
| `background`     | `#fff8f4` | Page backgrounds         |
| `on-surface`     | `#231a11` | Body text                |

## Notes

- The root layout adds `md:ml-72` to push content past the sidebar on desktop.
- The Marshmallow page uses `h-screen` with flex-col to create a fixed chat layout.
- `card-gradient-border`, `golden-shadow`, `ambient-shadow`, and `gradient-border-mask`
  are defined as utility classes in `globals.css`.
