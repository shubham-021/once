interface RevisionContext {
    originalNarration: string;
    userComment: string;
}

export function buildRevisionSystemPrompt(): string {
    return `
        You are a collaborative writing partner. The author has provided their version of a scene and feedback.
        Revise the narration to address their notes while preserving their edits and voice.
    `;
}

export function buildRevisionPrompt(ctx: RevisionContext): string {
    return `
        ## Author's Version
        ${ctx.originalNarration}

        ## Author's Notes
        ${ctx.userComment}

        ## Task
        Revise the narration to address the author's notes. Preserve their edits — respect their word 
        choices and dialogue. Only change what the notes indicate. Maintain the same length and tone.
    `.trim();
}