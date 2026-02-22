import { Skeleton } from "@/components/ui/skeleton";

export function StoryCardSkeleton() {
    return (
        <div className="border border-line rounded-xl bg-surface p-5">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-4" />
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}