"use client";

import React, { useState, useEffect } from "react";
import { PublicStoryCard } from "./public-story-card";
import { Flame, TrendingUp, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileDrawer from "../mobile-drawer";
import { storiesApi } from "@/lib/api";
import { DiscoverResult, genres, Story } from "@once/shared";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { PublicStoryCardSkeleton } from "./public-story-card-skeleton";
import { Skeleton } from "../ui/skeleton";

const trendingTags = ["grimdark", "time-loop", "redemption", "betrayal", "survival"];
const genreOptions = ["All", ...genres] as const;

// const mockStories: DiscoverResult[] = [
//     { id: "1", title: "The Hollow King", author: "Marcus Webb", genre: "Fantasy", upvotes: 234, description: "A tale of a fallen monarch seeking redemption in a world that has forgotten him.", turnCount: 47 },
//     { id: "2", title: "Signal in the Static", author: "Elena Cross", genre: "Science Fiction", upvotes: 189, description: "When the last radio station on Earth picks up a message from the void, everything changes.", turnCount: 23 },
//     { id: "3", title: "Blood & Clockwork", author: "James Chen", genre: "Science Fantasy", upvotes: 156, description: "Victorian London meets eldritch horror in this steampunk thriller.", turnCount: 65 },
//     { id: "4", title: "The Last Detective", author: "Sarah Mills", genre: "Crime and Mystery", upvotes: 112, description: "In a city where crime has been eradicated, one last murder changes everything.", turnCount: 31 },
//     { id: "5", title: "Hearts of Iron", author: "Alex Rivera", genre: "Romance", upvotes: 98, description: "Two rival knights discover love on the battlefield.", turnCount: 19 },
// ];

export function Discover() {

    const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
    const [selectedGenre, setSelectedGenre] = useState("All");
    const [showFilters, setShowFilters] = useState(false);
    const [stories, setStories] = useState<DiscoverResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalpages] = useState(1);
    const [stats, setStats] = useState<{ storiesPublished: number; activeWriters: number } | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            setIsLoading(true);
            const response = await storiesApi.discover({
                genre: selectedGenre,
                sortBy,
                page
            });

            if (response.data) setStories(response.data);
            if (response.meta?.total && response.meta?.pageSize) setTotalpages(Math.ceil(response.meta.total / response.meta.pageSize));

            setIsLoading(false);
        };
        fetchStories();
        // setStories(mockStories);
        // setTotalpages(3); 
        // setIsLoading(false);
    }, [selectedGenre, sortBy, page]);

    useEffect(() => {
        const fetchStats = async () => {
            const states = await storiesApi.discoverStats();
            if (states.data) setStats(states.data);
        }
        fetchStats();
        // setStats({ storiesPublished: 1247, activeWriters: 892 });
    }, []);

    return (
        <>
            <div className="h-screen flex flex-col bg-background">
                <header className="dotted-border-b px-4 md:px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl text-foreground">Discover</h1>
                        <p className="mt-1 text-sm text-muted">Public stories from the community</p>
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className="min-[720]:hidden fixed bottom-10 group right-4 z-40 flex gap-2 items-center justify-center py-2 px-4 rounded-full bg-accent/10 border border-accent/40 shadow-lg transition-colors cursor-pointer"
                    >
                        <Filter className="size-3.5 text-accent group-hover:size-6 transition-all ease-in-out" />
                        <span>filter</span>
                    </button>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <aside className="hidden min-[720]:block sm:w-48 md:w-56 shrink-0 dotted-border-r py-4 px-4 md:px-8 overflow-y-auto">
                        <SidebarSection title="Sort By">
                            <div className="space-y-1">
                                <SortButton
                                    active={sortBy === "hot"}
                                    onClick={() => setSortBy("hot")}
                                    icon={<Flame className={cn("size-4", sortBy === "hot" && "fill-accent")} />}
                                    label="Hot"
                                />
                                <SortButton
                                    active={sortBy === "new"}
                                    onClick={() => setSortBy("new")}
                                    icon={<Clock className="size-4" />}
                                    label="New"
                                />
                                {/* <SortButton active={sortBy === "top"} onClick={() => setSortBy("top")} icon={<TrendingUp className="size-4" />} label="Top" /> */}
                            </div>
                        </SidebarSection>

                        <SidebarSection title="Genre">
                            <div className="space-y-1">
                                {genreOptions.map((genre) => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(genre)}
                                        className={cn(
                                            "w-full text-left px-2 py-1 text-sm transition-colors cursor-pointer",
                                            selectedGenre === genre
                                                ? "text-accent"
                                                : "text-muted hover:text-foreground"
                                        )}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </SidebarSection>
                    </aside>

                    <MobileDrawer
                        className="py-4 px-6"
                        open={showFilters}
                        onClose={() => setShowFilters(false)}
                        side="left"
                    >
                        <SidebarSection title="Sort By">
                            <div className="space-y-1">
                                <SortButton active={sortBy === "hot"} onClick={() => setSortBy("hot")} icon={<Flame className="size-4" />} label="Hot" />
                                <SortButton active={sortBy === "new"} onClick={() => setSortBy("new")} icon={<Clock className="size-4" />} label="New" />
                                {/* <SortButton active={sortBy === "top"} onClick={() => setSortBy("top")} icon={<TrendingUp className="size-4" />} label="Top" /> */}
                            </div>
                        </SidebarSection>
                        <SidebarSection title="Genre">
                            <div className="space-y-1">
                                {genreOptions.map((genre) => (
                                    <button
                                        key={genre}
                                        onClick={() => { setSelectedGenre(genre); setShowFilters(false); }}
                                        className={cn(
                                            "w-full text-left px-2 py-1 text-sm transition-colors cursor-pointer",
                                            selectedGenre === genre ? "text-accent" : "text-muted hover:text-foreground"
                                        )}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </SidebarSection>
                    </MobileDrawer>

                    <main className="flex-1 p-6 overflow-y-auto" data-lenis-prevent>
                        <div className="max-w-2xl mx-auto space-y-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => <PublicStoryCardSkeleton key={i} />)}
                                </div>
                            ) : stories.length === 0 ? (
                                <p className="text-muted text-center py-8">No public stories yet</p>
                            ) : (
                                stories.map((story) => (
                                    <PublicStoryCard key={story.id} story={story} />
                                ))
                            )}
                        </div>

                        {totalPages > 1 && (
                            <Pagination className="mt-8">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                        <PaginationItem key={p}>
                                            <PaginationLink
                                                onClick={() => setPage(p)}
                                                isActive={page === p}
                                                className="cursor-pointer"
                                            >
                                                {p}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </main>

                    <aside className="hidden xl:block w-72 shrink-0 dotted-border-l p-4 overflow-y-auto">
                        <SidebarSection title="Community Stats">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted">Stories Published</span>
                                    {stats ? (
                                        <span className="text-foreground">{stats.storiesPublished.toLocaleString()}</span>
                                    ) : (
                                        <Skeleton className="h-4 w-12" />
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Active Writers</span>
                                    {stats ? (
                                        <span className="text-foreground">{stats.activeWriters.toLocaleString()}</span>
                                    ) : (
                                        <Skeleton className="h-4 w-12" />
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Words Written Today</span>
                                    <span className="text-foreground">48.2k</span>
                                </div>
                            </div>
                        </SidebarSection>

                        <SidebarSection title="Trending Tags">
                            <div className="flex flex-wrap gap-2">
                                {trendingTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 text-xs border border-line text-muted hover:text-foreground hover:border-foreground/50 cursor-pointer transition-colors"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </SidebarSection>

                        <SidebarSection title="Top This Week">
                            <div className="space-y-3">
                                <MiniStory rank={1} title="The Hollow King" upvotes={234} />
                                <MiniStory rank={2} title="Signal in the Static" upvotes={189} />
                                <MiniStory rank={3} title="Blood & Clockwork" upvotes={156} />
                            </div>
                        </SidebarSection>
                    </aside>
                </div>
            </div>
        </>
    );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-muted mb-3">{title}</h3>
            {children}
        </div>
    );
}

function SortButton({
    active,
    onClick,
    icon,
    label
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm transition-colors cursor-pointer",
                active ? "text-accent" : "text-muted hover:text-foreground"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function MiniStory({ rank, title, upvotes }: { rank: number; title: string; upvotes: number }) {
    return (
        <div className="flex items-start gap-2">
            <span className="text-xs text-muted w-4">{rank}.</span>
            <div className="flex-1">
                <p className="text-sm text-foreground hover:underline cursor-pointer">{title}</p>
                <p className="text-xs text-muted">{upvotes} upvotes</p>
            </div>
        </div>
    );
}