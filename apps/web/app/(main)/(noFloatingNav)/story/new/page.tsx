"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateStore } from "@/stores/create-store";
import { StoryInterface } from "@/components/story/storyInterface";

export default function NewStoryPage() {
  const router = useRouter();
  const [creationData] = useState(() => useCreateStore.getState().formData);

  useEffect(() => {
    if (!creationData) router.push("/library");
  }, []);


  if (!creationData) return null;

  return (
    <StoryInterface creationData={creationData} />
  );
}
