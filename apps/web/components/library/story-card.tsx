import Link from "next/link";
import { BookOpen, Clock, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Story } from "@once/shared";
import { storiesApi } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useRef, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { optionsApi } from "@/lib/api/options";
import { toast } from "sonner";

export function StoryCard({ story, onDelete, onVisibilityChange, onStatusChange, onForkChange }: { story: Story, onDelete: (id: number) => void, onVisibilityChange: (id:number, option:'public'|'private'|'unlisted')=>void, onStatusChange: (id:number, option:'active'|'completed'| 'abandoned')=>void, onForkChange: (id:number) => void}) {

    const [showConfirm, setShowConfirm] = useState(false);
    const inProgress = useRef<boolean>(false);

    const handleDelete = async () => {
        inProgress.current = true;
        const response = await storiesApi.delete(story.id.toString());
        if (response.error) {
            toast.error("Error while executing this req. Try again some times later");
            inProgress.current = false;
            return;
        }

        onDelete(story.id);
        inProgress.current = false;
        setShowConfirm(false);
    }

    const handleVisibility = async () => {
        inProgress.current = true;
        const option = (story.visibility === "public") ? "private" : "public";
        const response = await optionsApi.visibility(story.id.toString(),option);
        if(response.error){
           toast.error("Error while executing this req. Try again some times later");
           inProgress.current = false;
           return; 
        }

        onVisibilityChange(story.id, option);
        inProgress.current=false;
    }

    const handleStatus = async () => {
        inProgress.current = true;
        const option = (story.status === "active") ? "completed" : "active";
        const response = await optionsApi.status(story.id.toString(),option);
        if(response.error){
           toast.error("Error while executing this req. Try again some times later");
           inProgress.current = false;
           return; 
        }

        onStatusChange(story.id,option);
        inProgress.current = false;
    }

    const handleForking = async () => {
        inProgress.current = true;
        const option = !story.allowForking;
        const response = await optionsApi.fork(story.id.toString(),option);
        if(response.error){
            console.log(response.error);
            toast.error("Error while executing this req. Try again some times later");
            inProgress.current = false;
            return; 
        }

        onForkChange(story.id);
        inProgress.current = false;
    }

    return (
        <>
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Story</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this story? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer text-white bg-accent/70 hover:bg-accent">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-danger hover:bg-red-600 text-white cursor-pointer">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Link href={`/story/${story.id}`} className="group relative block h-full rounded-xl border border-line bg-surface p-5 transition-colors hover:border-foreground/30">
                <div className="absolute top-6 right-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="text-muted hover:text-foreground cursor-pointer focus:outline-none">
                            <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="space-y-2">
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setShowConfirm(true)
                            }} className="text-danger group hover:text-white cursor-pointer">
                                <Trash2 className="size-4 mr-2 text-danger group-hover:text-white" />
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleVisibility();
                            }} className="cursor-pointer hover:text-white">
                                {(story.visibility === "public") ? "Mark this private" : "Mark this public"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStatus();
                            }} className="cursor-pointer hover:text-white">
                                {(story.status === "active") ? "Mark this complete" : "Mark this active"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleForking();
                            }} className="cursor-pointer hover:text-white">
                                {(story.allowForking === true) ? "Disallow Forking" : "Allow Forking"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h2 className="text-lg text-foreground">
                    {story.title}
                </h2>

                {story.protagonist?.[0]?.name && (
                    <p className="mt-1 text-sm text-muted">
                        as <span className="text-foreground/80">{story.protagonist[0].name}</span>
                    </p>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            {/* TODO: change icon later */}
                            <BookOpen className="size-3" />
                            {story.turnCount.toLocaleString()} turns
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(story.updatedAt).toLocaleDateString()}
                        </span>
                    </div>
                    <span className={cn(story.status === "completed" ? "text-accent" : "text-muted/50")}>
                        {story.status === "completed" ? "Completed" : "In progress"}
                    </span>
                </div>
            </Link>
        </>
    );
}