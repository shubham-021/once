"use client";

import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { User, BarChart2, Users, LogOut } from "lucide-react";
import { Analytics } from "@/components/analytics/analytics";
import { CharacterVault } from "@/components/vault/character-vault";

type Tab = "profile" | "analytics" | "vault";

export function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/auth/login";
  };

  const sidebarItems: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "vault", label: "Vault", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-line bg-surface flex flex-col">
        <div className="p-6 border-b border-line">
          <h1 className="text-lg font-medium text-foreground">Settings</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                    activeTab === item.id
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-foreground hover:bg-surface",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sign Out at bottom */}
        <div className="p-4 border-t border-line">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        {activeTab === "profile" && <ProfileContent user={session?.user} />}
        {activeTab === "analytics" && <Analytics />}
        {activeTab === "vault" && <CharacterVault />}
      </main>
    </div>
  );
}

function ProfileContent({
  user,
}: {
  user?: { name: string; email?: string; image?: string | null } | null;
}) {
  if (!user) {
    return <div className="p-8 text-muted">Loading profile...</div>;
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-2xl text-foreground">Your Profile</h2>
        <p className="mt-1 text-sm text-muted">
          Manage your account information
        </p>
      </header>

      <div className="max-w-md space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="size-16 rounded-full border border-line"
            />
          ) : (
            <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center border border-line">
              <User className="size-8 text-accent" />
            </div>
          )}
          <div>
            <p className="text-lg font-medium text-foreground">{user.name}</p>
            <p className="text-sm text-muted">Author</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-4 pt-4 border-t border-line">
          <div>
            <label className="text-xs text-muted uppercase tracking-wide">
              Name
            </label>
            <p className="mt-1 text-foreground">{user.name}</p>
          </div>

          {user.email && (
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">
                Email
              </label>
              <p className="mt-1 text-foreground">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
