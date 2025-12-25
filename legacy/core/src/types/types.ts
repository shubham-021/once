export type TurnHistory = {
    action: string;
    narration: string;
}

export type PROMPT_PROPS = {
    genre: string,
    protagonist_detail: {
        name: string,
        location: string,
        health: number,
        inventory: string[],
        traits: string[],
    },
    factual_knowledge:string[],
    recency_buffer: TurnHistory[],
    isRewriteMode?: boolean
}

export type MODEL_PROPS = {
    user_feed: string,
    context: PROMPT_PROPS
}

export type Messages = Array<{
    role: "user"|"assistant",
    content:string
}>

export type INITIAL_PROMPT_PROPS = {
    genre: string,
    protagonist_name: string,
    protagonist_trait: string,
    starting_location: string,
    starting_scenario: string,
}