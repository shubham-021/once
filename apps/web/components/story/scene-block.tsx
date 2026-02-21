import type { Scene } from "@once/shared";
import { Undo2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useRef, useState } from "react";
import { storiesApi } from "@/lib/api";
import { toast } from "sonner";

interface SceneBlockProps {
    storyId: number;
    turnNumber: number;
    narration: string;
    userAction: string|null;
    handleUndo: (storyId:string, turnNumber:string) => void;
    inProgress: boolean;
}

export function SceneBlock({ storyId,turnNumber,narration,userAction,handleUndo,inProgress }: SceneBlockProps) {

    const [showConfirm, setShowConfirm] = useState(false);

    const handleClick = () => {
        console.log(inProgress);
        if(inProgress){
            toast.info('Another undo req is in progress.')
            return;
        }

        setShowConfirm(prev => !prev);
    }

    const handleFinalClick = () => {
        handleUndo(storyId.toString(),turnNumber.toString());
    }

    return (
        <>
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Undo Scene</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to undo till this scene? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer text-white bg-accent/70 hover:bg-accent">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinalClick} className="bg-danger hover:bg-red-600 text-white cursor-pointer">
                            Undo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="mb-6">
                {userAction && userAction !== '[STORY_START]' && (
                    <div className="flex items-center justify-between text-accent italic mb-3">
                        <div className="flex gap-2">
                            <span className="text-accent">{">"}</span>
                            {userAction}
                        </div>
                        <div onClick={handleClick} className="h-5 w-5 rounded-full text-accent flex items-center justify-center cursor-pointer">
                            <Undo2 className="size-3.5"/>
                        </div>
                    </div>
                )}
                <div className="prose dark:prose-invert prose-p:my-3 max-w-none">
                    {narration.split('\n\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </>
    );
}