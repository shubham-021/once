import { optionsApi } from "@/lib/api";
import { useLibraryStore } from "@/stores/library-store";
import { useState } from "react";
import { toast } from "sonner";

export default function Description({onSubmit}: {onSubmit: (id:number, description:string) => void}) {

  const [description,setDescription] = useState<string>("");

  const setShowPublicDescription = useLibraryStore(s => s.setShowPublicDescription);
  const setInProgress = useLibraryStore(s => s.setInProgress);
  const inProgress = useLibraryStore(s => s.inProgress);
  const story = useLibraryStore(s => s.inFocusStory);

  // console.log(inProgress);

    const submit = async () => {
      if(inProgress || story === null || description.trim().length === 0) return;
      setInProgress(true);

      try {
        const response = await optionsApi.visibility(story.id.toString(), "public", description);
        if(response.error) throw new Error(response.error.message);

        toast.success("Visibility changed to public.");
        onSubmit(story.id, description);
        setShowPublicDescription(false);
      } catch (err){
        toast.error("Error while changing visibility.");
      } finally {
        setInProgress(false);
      }
    }


  return (
    <div
      onClick={() => setShowPublicDescription(false)}
      className="absolute inset-0 z-50 flex items-center justify-center bg-surface/10 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-150 h-110 flex flex-col bg-background/80 border border-muted rounded-xl p-6 shadow-2xl relative"
      >
        <header className="flex flex-col gap-1">
          <span className="text-2xl font-semibold tracking-tight">
            Public Description
          </span>
          <span className="text-xs text-muted-foreground">
            {"(This description will be shown on the discover page. It will act as first impression for the story.)"}
          </span>
        </header>
        <div className="flex flex-col flex-1 gap-4 py-4">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Write description
            </label>
            <textarea
              placeholder="Share the hook, tone, and what makes this story special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 resize-none rounded-lg border border-muted bg-background/40 px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition focus:border-foreground/60"
            />
            <div className="text-[10px] text-muted-foreground">
              Aim for 2-4 sentences. Keep it vivid and scannable.
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 absolute -bottom-12 right-0">
            <button
                onClick={() => setShowPublicDescription(false)}
                className="rounded-lg border border-accent/20 px-4 py-2 text-xs uppercase tracking-widest text-accent transition hover:border-accent/40 hover:text-foreground cursor-pointer"
            >
                Cancel
            </button>
            <button disabled={inProgress || story === null || description.trim().length === 0} onClick={submit} className="rounded-lg bg-accent/20 border border-accent/40 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:bg-muted/10 disabled:text-muted/40 disabled:border-0">
                Submit Description
            </button>
        </div>
      </div>
    </div>
  );
}
