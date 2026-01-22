import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { SceneBlockView } from './scene-block-view'

export const SceneBlock = Node.create({
    name: 'sceneBlock',
    group: 'block',
    atom: true,
    selectable: false,
    draggable: false,

    addAttributes() {
        return {
            sceneId: { default: null },
            narration: { default: '' },
            userAction: { default: null },
        }
    },

    parseHTML() {
        return [{ tag: 'div[data-scene-block]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-scene-block': '' }), 0]
    },

    addNodeView() {
        return ReactNodeViewRenderer(SceneBlockView)
    },
})