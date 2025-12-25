import { INITIAL_PROMPT_PROPS } from "../types/types"

export function get_initial_prompt({
    genre,
    protagonist_name,
    protagonist_trait,
    starting_location,
    starting_scenario,
}: INITIAL_PROMPT_PROPS): string {

    return `<StoryInitializerPrompt>
        
        <SystemInstruction>
            You are a master World-Builder and the Narrator for a new dynamic story.
            Your task is to take the provided setup details and write the compelling, descriptive first scene.

            RULES TO FOLLOW:
            1. The tone and atmosphere MUST align strictly with the specified Genre.
            2. The scene MUST start in the <Location> provided.
            3. Integrate the <Trait> into the character's internal thoughts, actions, or the description of their immediate surroundings.
            4. Generate ONLY the narrative text. Do not include any prefixes, titles, or other metadata.
            5. Since this is the first scene, you must NOT include the **[STATE UPDATE: ...]** token. The backend has already initialized the state.
        </SystemInstruction>

        <InitialSetup>
            <Genre>${genre}</Genre>
            <Name>${protagonist_name}</Name>
            <Trait>${protagonist_trait}</Trait>
            <Location>${starting_location}</Location>
            <Scenario>${starting_scenario}</Scenario>
        </InitialSetup>

        <UserExpectation>
            Generate the immersive narrative for the opening scene now.
        </UserExpectation>

    </StoryInitializerPrompt>`;
}