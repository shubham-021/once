# Plan: Radial Menu from Origami Icon

## Goal

Replace the bottom dock with a radial menu that fans out from the origami icon (top-right) when clicked. Buttons appear in a bottom-left quadrant arc.

## Completed Changes

### Phase 1: Radial Menu (DONE)

1. **Created** `apps/web/components/ui/radial-menu.tsx`
   - Renders items in a radial arc (90° to 180°)
   - Uses framer-motion for staggered animations
   - Radius: 170px
   - Click-outside and Escape key to close

2. **Modified** `apps/web/components/user-menu.tsx`
   - Replaced dropdown with RadialMenu
   - Origami button toggles menu open/close

3. **Updated** `apps/web/app/(main)/(others)/layout.tsx`
   - Removed FloatingNav

4. **Deleted**
   - `apps/web/components/floating-nav.tsx`
   - `apps/web/components/ui/floating-dock.tsx`

### Phase 2: Profile Page (DONE)

1. **Updated radial menu items** (5 items now):
   - Home (90°) - directly below origami
   - Library
   - Discover
   - Create
   - Profile (180°) - directly left of origami
   - _Removed: Analytics, Vault (moved to profile page)_

2. **Created** `apps/web/app/(main)/(others)/profile/page.tsx`
   - Route wrapper for profile page

3. **Created** `apps/web/components/profile/profile-page.tsx`
   - Left sidebar with tabs: Profile, Analytics, Vault
   - Sign Out button at bottom of sidebar
   - Content area switches based on active tab
   - Reuses existing Analytics and CharacterVault components

4. **Updated** `apps/web/components/library/library.tsx`
   - Empty state now shows centered "Create now" button
   - Links to /create page

## Current Navigation Structure

```
Radial Menu (from Origami):
├── Home (/)
├── Library (/library)
├── Discover (/discover)
├── Create (/create)
└── Profile (/profile)

Profile Page Sidebar:
├── Profile (user info)
├── Analytics (stats)
├── Vault (characters)
└── Sign Out
```

## Arc Geometry

- Start angle: 90° (directly down - Home)
- End angle: 180° (directly left - Profile)
- 5 items spread across 90° arc = 22.5° between each
- Radius: 170px
