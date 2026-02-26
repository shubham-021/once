import { Skeleton } from "@/components/ui/skeleton";

export function PublicStoryCardSkeleton() {
    return (
        <div className="border border-line bg-surface p-5 flex flex-col rounded-xl">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4 mb-3" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
            <div className="mt-auto pt-4 flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
        </div>
    );
}