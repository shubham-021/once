"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { SceneBlock } from './extensions/scene-block'
import { DraftBlock } from './extensions/draft-block'
import type { Scene } from '@once/shared'
import { useEffect } from 'react'

interface UnifiedEditorProps {
    scenes: Scene[]
    draft: { id: number; narration: string } | null
    isStreaming: boolean
    isAccepting: boolean
    onNarrationChange?: (narration: string) => void
    onRevise?: (narration: string, comment: string) => void
    onSaveEdits?: (narration: string) => void
    onAccept?: () => void
    onDiscard?: () => void
}

function buildContent(scenes: Scene[], draft: { id: number; narration: string } | null) {
    const content: any[] = []

    scenes.forEach(scene => {
        content.push({
            type: 'sceneBlock',
            attrs: {
                sceneId: scene.id,
                narration: scene.narration,
                userAction: scene.userAction,
            }
        })
    })

    if (draft) {
        content.push({
            type: 'draftBlock',
            attrs: { draftId: draft.id },
            content: draft.narration
                ? draft.narration.split('\n\n').map(p => ({
                    type: 'paragraph',
                    content: p ? [{ type: 'text', text: p }] : []
                }))
                : [{ type: 'paragraph' }]
        })
    }

    if (content.length === 0) {
        content.push({ type: 'paragraph' })
    }

    return { type: 'doc', content }
}

export function UnifiedEditor({ scenes, draft, isStreaming, onNarrationChange }: UnifiedEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
            }),
            SceneBlock,
            DraftBlock,
        ],
        content: buildContent(scenes, draft),
        editable: !isStreaming && !!draft,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            if (onNarrationChange && draft) {
                const draftNode = editor.state.doc.content.content.find(
                    (node: any) => node.type.name === 'draftBlock'
                )
                if (draftNode) {
                    const text = draftNode.textContent
                    onNarrationChange(text)
                }
            }
        },
    }, [scenes.length])

    useEffect(() => {
        if (editor) editor.setEditable(!isStreaming && !!draft)
    }, [editor, isStreaming, !!draft])


    useEffect(() => {

        if (!editor) return;

        if (!isStreaming && draft) return;

        queueMicrotask(() => {
            const currentContent = buildContent(scenes, draft)
            editor.commands.setContent(currentContent)
        })
    }, [editor, scenes.length, draft?.narration, draft?.id, !!draft])

    return (
        <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none focus:outline-none"
        />
    )
}