import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { DraftBlockView } from './draft-block-view'

export const DraftBlock = Node.create({
    name: 'draftBlock',
    group: 'block',
    content: 'block+',
    defining: true,

    addAttributes() {
        return {
            draftId: { default: null },
        }
    },

    parseHTML() {
        return [{ tag: 'div[data-draft-block]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-draft-block': '' }), 0]
    },

    addNodeView() {
        return ReactNodeViewRenderer(DraftBlockView)
    },
})