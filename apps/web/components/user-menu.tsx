"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Origami,
  User,
  Home,
  BookOpen,
  Compass,
  PlusCircle,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RadialMenu, RadialMenuItem } from "@/components/ui/radial-menu";
import { LinearMenu } from "./ui/linear-menu";
import { useCreateStore } from "@/stores/create-store";

const navItems: RadialMenuItem[] = [
  {
    title: "Library",
    icon: (className: string) => (
      <BookOpen className={cn("h-full w-full", className)} />
    ),
    href: "/library",
  },
  {
    title: "Discover",
    icon: (className: string) => (
      <Compass className={cn("h-full w-full", className)} />
    ),
    href: "/discover",
  },
  {
    title: "Profile",
    icon: (className: string) => (
      <User className={cn("h-full w-full", className)} />
    ),
    href: "/profile",
  },
  {
    title: "Credits",
    icon: (className: string) => (
      <Coins className={cn("h-full w-full", className)} />
    ),
    href: "/credits"
  },
  {
    title: "Home",
    icon: (className: string) => (
      <Home className={cn("h-full w-full", className)} />
    ),
    href: "/",
  }
];

export function UserMenu() {
  const pathname = usePathname();
  const [isRadialOpen, setIsRadialOpen] = useState(false);

  const toggleRadialMenu = () => {
    setIsRadialOpen(!isRadialOpen);
  };

  const closeRadialMenu = () => {
    setIsRadialOpen(false);
  };

  const setOpen = useCreateStore((s) => s.setOpen);

  const withCreateButton: RadialMenuItem[] = [
    {
      title: 'Create',
      icon: (className: string) => (
        <PlusCircle className={cn("h-full w-full", className)} />
      ),
      onClick: () => setOpen(true)
    },
    ...navItems
  ]

  return (
    <div className="fixed top-8 right-8 z-50">
      <div className="relative">
        <button
          onMouseEnter={() => setIsRadialOpen(true)}
          onClick={toggleRadialMenu}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "bg-surface border border-line hover:border-accent",
            "transition-colors cursor-pointer focus:outline-none z-10",
            isRadialOpen && "border-accent",
          )}
        >
          <Origami
            className={cn(
              "w-5 h-5",
              isRadialOpen ? "text-accent" : "text-accent",
            )}
          />
        </button>

        <LinearMenu
          items={withCreateButton}
          isOpen={isRadialOpen}
          onClose={closeRadialMenu}
          currentPath={pathname}
        />
      </div>
    </div>
  );
}
