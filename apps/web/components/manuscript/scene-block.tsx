import type { Scene } from "@once/shared";

interface Props {
    scene: Scene;
}

export function SceneBlock({ scene }: Props) {
    const isOpeningScene = scene.userAction === "[STORY_START]";

    return (
        <div className="opacity-90">
            {!isOpeningScene && (
                <p className="text-muted italic mb-2">› {scene.userAction}</p>
            )}
            <div className="text-foreground whitespace-pre-line leading-relaxed">
                {scene.narration}
            </div>
        </div>
    );
}