import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'

export function DraftBlockView({ node }: NodeViewProps) {
    return (
        <NodeViewWrapper
            className="draft-block p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 mb-6"
        >
            <NodeViewContent className="prose dark:prose-invert prose-p:my-3 max-w-none outline-none" />
        </NodeViewWrapper>
    )
}