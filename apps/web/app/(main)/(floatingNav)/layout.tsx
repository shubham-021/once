"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { CampfireToggle } from "@/components/campfire-toggle";
import { UserMenu } from "@/components/user-menu";
import { CreateStoryModal } from "@/components/create/create-story-modal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <main>{children}</main>
      <UserMenu />
      <CampfireToggle />

      <CreateStoryModal />
    </>
  );
}
