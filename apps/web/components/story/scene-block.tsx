import type { Scene } from "@once/shared";

interface SceneBlockProps {
    narration: string;
    userAction: string|null;
}

export function SceneBlock({ narration,userAction }: SceneBlockProps) {
    return (
        <div className="mb-6">
            {userAction && userAction !== '[STORY_START]' && (
                <p className="text-accent italic mb-3">
                    <span className="mr-2 text-accent">{">"}</span>
                    {userAction}
                </p>
            )}
            <div className="prose dark:prose-invert prose-p:my-3 max-w-none">
                {narration.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
}