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
        <original_version>
            ${ctx.originalNarration}
        </original_version>

        <author_note>
            ${ctx.userComment}
        <author_note>

        <task>
            Revise the narration to address the author's notes. Preserve their edits, respect their word 
            choices and dialogue. Only change what the notes indicate. Maintain the same length and tone.
        </task>
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

        <story_context>
            title: ${ctx.title}
            genre: ${ctx.genre}
            ${ctx.protagonist ? `protagonist: ${ctx.protagonist.name} — ${ctx.protagonist.description || 'No description'}` : ''}
            ${ctx.worldDescription ? `world: ${ctx.worldDescription}` : ''}
            ${ctx.storyIdea ? `story Idea: ${ctx.storyIdea}` : ''}
        <story_context>

        <original_narration>
            ${ctx.originalNarration}
        </original_narration>

        <user_feedback>
            ${ctx.userComment}
        </user_feedback>

        <task>
            Revise the opening scene narration based on the user's feedback while maintaining the story's genre, tone, and established context. Output only the revised narration, no preamble.
        </task>
    `;
}