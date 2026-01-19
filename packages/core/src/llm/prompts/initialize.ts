import type { NarrativeStance, StoryMode } from "@once/shared/schemas";

interface InitializeContext {
    title: string;
    genre: string;
    stance: NarrativeStance;
    mode: StoryMode;
    plot?: string;
    startingScene?: string;
    cast?: Array<{ name: string; description: string }>;
    castMode?: 'strict' | 'flexible';
    protagonist?: {
        name: string;
        description?: string;
        traits: string[];
    };
}

export function buildInitializePrompt(ctx: InitializeContext): string {
    const hasProtagonist = ctx.mode === "protagonist" && ctx.protagonist;

    if (hasProtagonist) {
        const p = ctx.protagonist!;
        return `Create the opening scene for a ${ctx.genre} story titled "${ctx.title} ${ctx.plot ? `and following the plot ${ctx.plot}` : ", there is no rigid plot, explore the best story around this contexts"}".

            ## Protagonist
            - Name: ${p.name}
            - Description: ${p.description || "Not specified — infer from traits"}
            - Traits: ${p.traits.length > 0 ? p.traits.join(", ") : "None specified"}

            ${ctx.startingScene ? `
            ## Opening Direction
            The author envisions the story beginning with:

            ${ctx.startingScene}
            Use this as your starting point.
            ` : ''}

            ${ctx.cast && ctx.cast.length > 0 ? `
            ## Cast
            The author has defined these characters:
            
            ${ctx.cast.map(c => `- ${c.name}: ${c.description}`).join('\n')}
            ${ctx.castMode === "strict"
                    ? "Use ONLY these characters. Do not introduce anyone not on this list."
                    : "You have to use these characters or create your own as the story requires, but give priority to this list if the story requirement can be fullfill by this"}
                    For characters not introduced in this scene, output them as deferredCharacters with a natural trigger condition.
            ` : ''}

            ## Requirements
            1. Begin in media res — the protagonist is already in motion, facing a situation
            3. Introduce a hook — a problem, mystery, or choice that demands attention
            4. Show the protagonist's personality through action, not exposition
            5. End at a moment that invites the player to act

            Write 200-400 words. No meta-commentary. Just the scene.
        `;
    }

    return `Create the opening scene for a ${ctx.genre} story titled "${ctx.title}".

            ${ctx.startingScene ? `
                ## Opening Direction
                The author envisions the story beginning with:
                ${ctx.startingScene}
                Use this as your starting point.
            ` : ''}

            ${ctx.cast && ctx.cast.length > 0 ? `
                ## Cast
                The author has defined these characters for the story:
                ${ctx.cast.map(c => `- ${c.name}: ${c.description}`).join('\n')}
                Introduce characters naturally as the scene allows. For characters not introduced in this scene, they will be stored for later introduction. Output which characters you used and which should be deferred.
            ` : ''}

            ## Requirements
            1. Generate a compelling protagonist with a name, appearance, and clear personality
            2. Place them in a specific, vivid location
            3. Begin in media res — they are already facing a situation
            4. Introduce a hook — a problem, mystery, or choice
            5. End at a moment that invites the player to act

            Write 200-400 words. No meta-commentary. Just the scene.
    `;
}