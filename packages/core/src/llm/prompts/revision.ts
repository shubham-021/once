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

interface OpeningRevisionContext {
    originalNarration: string;
    userComment: string;
    title: string;
    genre: string;
    protagonist?: {
        id: number;
        description: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storyId: number;
        health: number;
        energy: number;
        currentLocation: string;
        baseTraits: string[];
        currentTraits: string[];
        inventory: string[];
        scars: string[];
        isActive: boolean;
    };
    worldDescription?: string | null;
    storyIdea?: string | null;
}

export function buildOpeningRevisionPrompt(ctx: OpeningRevisionContext): string {
    return `You are revising the opening scene of a story.

        STORY CONTEXT:
        - Title: ${ctx.title}
        - Genre: ${ctx.genre}
        ${ctx.protagonist ? `- Protagonist: ${ctx.protagonist.name} — ${ctx.protagonist.description || 'No description'}` : ''}
        ${ctx.worldDescription ? `- World: ${ctx.worldDescription}` : ''}
        ${ctx.storyIdea ? `- Story Idea: ${ctx.storyIdea}` : ''}

        ORIGINAL NARRATION:
        ${ctx.originalNarration}

        USER'S FEEDBACK:
        ${ctx.userComment}

        Revise the opening scene narration based on the user's feedback while maintaining the story's genre, tone, and established context. Output only the revised narration, no preamble.
    `;
}