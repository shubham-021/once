"use client";

import React, { useEffect, useRef, useState } from "react";
import { StoryCard } from "./story-card";
import { cn } from "@/lib/utils";
import { storiesApi } from "@/lib/api";
import type { Story } from "@once/shared";
import { toast } from "sonner";
import { useCreateStore } from "@/stores/create-store";
import { StoryCardSkeleton } from "./story-card-skeleton";
import Credit from "@/components/ui/Credit";
import Description from "./description";
import { useLibraryStore } from "@/stores/library-store";
import { SimpleToggle } from "../simple-theme-toggler";

export function Library() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isLoading, setIsLoading] = useState(true);

  const stories = useLibraryStore(s => s.stories);
  const setStories = useLibraryStore(s => s.setStories);
  const openDescription = useLibraryStore(s => s.showPublicDescription);

  // const inProgress = useRef<boolean>(false);

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

    const updatedStories = stories.filter(s => s.id !== id);

    setStories(updatedStories);
    toast.success("Story Deleted");
  };

  const handleVisibility = (
    id: number,
    option: "public" | "private" | "unlisted",
  ) => {

    const updatedStories = stories.map(s => {
      if (s.id === id) return { ...s, visibility: option };
      else return s;
    })

    setStories(updatedStories);

    toast.success("Visibility changed successfully");
  };

  const handleDescriptionSubmit = (id: number, description: string) => {
    const updatedStories = stories.map(s => {
      if (s.id === id) return { ...s, visibility: "public" as const, publicDescription: description };
      else return s;
    })

    setStories(updatedStories);
    // toast.success("Visibility changed successfully");
  }

  const handleStatus = (
    id: number,
    option: "active" | "completed" | "abandoned",
  ) => {

    const updatedStories = stories.map(s => {
      if (s.id === id) return { ...s, status: option };
      else return s;
    })

    setStories(updatedStories);

    toast.success("Status changed successfully");
  };

  const handleForking = (id: number) => {

    const updatedStories = stories.map(s => {
      if (s.id === id) return { ...s, allowForking: !s.allowForking };
      else return s;
    })

    setStories(updatedStories);

    toast.success("Fork allowed");
  };

  const filteredStories = stories.filter((s) =>
    filter === "all" ? true : s.status === filter,
  );

  // const filteredStories: Story[] = [];

  return (
    <>
      <div className="min-h-screen bg-background relative">
        {/* <ConstellationLoader/> */}
        {openDescription && <Description onSubmit={handleDescriptionSubmit} />}
        <header className="dotted-border-b px-4 py-6 whitespace-nowrap">
          <h1 className="text-2xl text-foreground">Your Library</h1>
          <p className="mt-1 text-sm text-muted">Stories you've begun</p>
        </header>

        <div className="flex gap-2 sm:gap-4 justify-between items-center p-4 dotted-border-b relative">
          <div className="flex gap-2 sm:gap-4">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-xs sm:text-sm capitalize transition-colors cursor-pointer bg-foreground/10 border border-foreground/40 px-2 py-1 rounded-xl",
                  filter === f
                    ? "bg-accent/20 border-accent/40 text-accent"
                    : "text-muted/60 hover:text-muted/80",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-4 items-center justify-center ml-4">
            <span className="md:hidden"><SimpleToggle className="flex items-center justify-center cursor-pointer py-1" /></span>
            <Credit className="bg-accent/10 border border-accent/20 py-1 px-2 rounded-xl text-xs sm:text-sm" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 p-4 md:p-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StoryCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center pt-30">
            <p className="text-muted mb-4">No stories yet</p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 border border-accent/40 text-white hover:bg-accent/40 transition-colors cursor-pointer"
            >
              Create now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:py-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onDelete={handleDelete}
                onVisibilityChange={handleVisibility}
                onStatusChange={handleStatus}
                onForkChange={handleForking}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
