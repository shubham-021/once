"use client";

import React, { useEffect, useState } from "react";
import { StoryCard } from "./story-card";
import { cn } from "@/lib/utils";
import { NavHeader } from "../nav-header";
import { storiesApi } from "@/lib/api";
import type { Story } from "@once/shared";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { ConstellationLoader } from "../loader";
import { useCreateStore } from "@/stores/create-store";
import { StoryCardSkeleton } from "./story-card-skeleton";

export function Library() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setOpen = useCreateStore((s) => s.setOpen);

  useEffect(() => {
    const fetchStories = async () => {
      const response = await storiesApi.list();
      if (response.data) setStories(response.data);
      setIsLoading(false);
    };

    fetchStories();
  }, []);

  const handleDelete = (id: number) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
    toast.success("Story Deleted");
  };

  const filteredStories = stories.filter((s) =>
    filter === "all" ? true : s.status === filter,
  );

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* <ConstellationLoader/> */}
        <header className="dotted-border-b px-4 py-6">
          <h1 className="text-2xl text-foreground">Your Library</h1>
          <p className="mt-1 text-sm text-muted">Stories you've begun</p>
        </header>

        <div className="flex gap-4 px-4 py-4 dotted-border-b">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-sm capitalize transition-colors cursor-pointer",
                filter === f
                  ? "text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 p-4 md:p-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <StoryCardSkeleton key={i} />)}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted mb-4">No stories yet</p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Create now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:p-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
