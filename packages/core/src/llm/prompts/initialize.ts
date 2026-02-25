import type { NarrativeStance, StoryMode } from "@once/shared/schemas";

interface InitializeContext {
  startingScene?: string;
}

export function buildInitializePrompt(ctx: InitializeContext): string {

  return `
      <task>
        Create the opening scene for this story. If starting scene is provided follow that, if not create the first scene for this story using your creativity of story writing.
        The opening scene must lay foundations and atmosphere, not resolve or jump into major plot events unless the user explicitly asks for them in the starting scene.

        <starting_scene_provided_by_user>
          Here is the starting scene provided by the user. Use this as the first beat and align the opening moment to it. Do not just copy paste, enhance the writing of it.

          ${ctx.startingScene}
        </starting_scene_provided_by_user>

      </task>
  `;
}
