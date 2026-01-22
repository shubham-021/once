import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'

export function SceneBlockView({ node }: NodeViewProps) {
    const { narration, userAction } = node.attrs

    return (
        <NodeViewWrapper className="scene-block mb-6" contentEditable={false} >
            {/* User action line (if exists and not opening) */}
            {
                userAction && userAction !== '[STORY_START]' && (
                    <p className="text-muted-foreground italic mb-3" >
                        <span className="mr-2 text-muted-foreground/50" >›</span>
                        {userAction}
                    </p>
                )
            }

            {/* Narration */}
            <div className="prose dark:prose-invert prose-p:my-3 max-w-none" >
                {
                    narration.split('\n\n').map((paragraph: string, i: number) => (
                        <p key={i} > {paragraph} </p>
                    ))
                }
            </div>
        </NodeViewWrapper>
    )
}