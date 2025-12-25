import { TurnHistory,PROMPT_PROPS } from "../types/types";

export function get_prompt({
    genre,
    protagonist_detail:protagonist,
    factual_knowledge,
    recency_buffer,
    isRewriteMode = false 
}:PROMPT_PROPS){ 
    
    const inventoryString = protagonist.inventory.join(', ');
    const traitsString = protagonist.traits.join(', ');

    const factualKnowledgeXml = factual_knowledge.map((fact, index) =>
        `<Fact type="RAG" id="${index + 1}">${fact}</Fact>`
    ).join('\n');

    const recencyBufferXml = recency_buffer.map((turn: TurnHistory, index) => 
        `<Turn number="${index + 1}">
            <Action>${turn.action}</Action>
            <Narration>${turn.narration}</Narration>
        </Turn>`
    ).join('\n');

    const rewriteInstruction = isRewriteMode
        ? `
            **NARRATIVE OVERRIDE MODE ACTIVE:** The story's past conclusion (death, failure, or ending) has been officially discarded by the system.
            Your immediate priority is to generate a scene that justifies this plot reversal (e.g., it was a dream, a time-travel flash, or divine intervention) and brings the protagonist back to a state where the current User Action is plausible.
            Use the current <LiveState> (which has been reset) as the new reality anchor.
            `
        : "";

    return `<StoryGeneratorPrompt>

        <SystemInstruction>
            You are the impartial, dynamic Narrator of a story in the ${genre} genre.
            Your sole task is to generate the next scene's narrative, strictly based on the provided context and the User Action.

            ${rewriteInstruction}

            RULES TO FOLLOW:
            1. Maintain absolute consistency with the data provided in the <LiveState> and <FactualKnowledge> tags.
            2. Generate ONLY the narrative text. Do not include user actions, scene numbers, or dialogue prefixes (e.g., Narrator:).
            3. Keep the tone appropriate for the specified genre.
            4. If a key fact is contradicted by the User Action (e.g., they try to fly without wings), generate a realistic narrative consequence based on the established rules of the world.
        </SystemInstruction>

        <LiveState>
            <Name>${protagonist.name}</Name>
            <Location>${protagonist.location}</Location>
            <Health>${protagonist.health}</Health>
            <Inventory>${inventoryString}</Inventory>
            <Traits>${traitsString}</Traits>
        </LiveState>

        <FactualKnowledge>${factualKnowledgeXml}</FactualKnowledge>

        <RecencyBuffer>${recencyBufferXml}</RecencyBuffer>

        <OutputProtocol>
            Must follow the given JSON schema to output response.
        </OutputProtocol>

    </StoryGeneratorPrompt>`
}