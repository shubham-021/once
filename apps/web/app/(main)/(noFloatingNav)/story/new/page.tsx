"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateStore } from "@/stores/create-store";
import { draftsApi } from "@/lib/api";
import { toast } from "sonner";
import { ConstellationLoader } from "@/components/ui/loader";
import { ManuscriptView } from "@/components/manuscript/manuscript-view";

export default function NewStoryPage() {
  const router = useRouter();
  const [creationData] = useState(() => useCreateStore.getState().formData);

  useEffect(() => {
    if (!creationData) router.push("/library");
  }, []);


  if (!creationData) return null;

  return (
    <ManuscriptView creationData={creationData} />
  );
}
