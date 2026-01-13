# Plan: Mobile Bottom Tab Bar & Tooltip Fix

## 1. Radial Menu Tooltip Fix

**File:** `apps/web/components/ui/radial-menu.tsx`

**Fix:** Dynamically elevate z-index on hover.

- Add `zIndex: hovered ? 60 : 10` to the button style.
- This ensures the active button and its tooltip child sit above all adjacent buttons.

## 2. Profile Page Mobile Navigation

**File:** `apps/web/components/profile/profile-page.tsx`

**Changes:**

1. **Remove** bottom sheet logic and mobile header menu button.
2. **Add** `MobileBottomNav` component (fixed at bottom).
3. **Add** "Sign Out" button to `ProfileContent` (visible only on mobile).

**Layout Structure:**

```tsx
<div className="flex flex-col h-screen md:flex-row bg-background">
  {/* Desktop Sidebar (hidden on mobile) */}
  <aside className="hidden md:flex ..." />

  {/* Main Content */}
  <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
    {/* pb-20 prevents content from being hidden behind bottom bar */}
    {activeTab === "profile" && <ProfileContent />}
    {activeTab === "analytics" && <Analytics />}
    {activeTab === "vault" && <CharacterVault />}
  </main>

  {/* Mobile Bottom Bar (hidden on desktop) */}
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-line flex justify-around items-center h-16 z-50 px-2 pb-safe">
    <TabButton tab="profile" icon={User} label="Profile" />
    <TabButton tab="analytics" icon={BarChart2} label="Analytics" />
    <TabButton tab="vault" icon={Users} label="Vault" />
  </nav>
</div>
```

**Sign Out Button:**

- Add to `ProfileContent` component
- Visible only on mobile (`md:hidden`)
- Placed below the info cards
