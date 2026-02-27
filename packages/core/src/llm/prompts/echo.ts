interface EchoEvalContext {
    pendingEchoes: Array<{
        id: number;
        description: string;
    }>;
    protagonistLocation: string;
    protagonistState: string;
    userAction: string;
    recentScenes: Array<{
        userAction: string;
        narration: string;
    }>;
}

export function buildEchoEvalPrompt(ctx: EchoEvalContext): string {
    if (ctx.pendingEchoes.length === 0) {
        return "";
    }

    const recentContext = `
        <recent_scenes>
            ${ctx.recentScenes.map((s, i) =>
                `<scene_${i + 1}>\n
                    <user_action>
                        ${s.userAction}
                    </user_action>
                    <narration>
                        ${s.narration}
                    </narration>
                <scene_${i + 1}>`
            ).join("\n\n")}
        </recent_scenes>
    `

    const echoList = ctx.pendingEchoes.map(e =>
        `
        <echo_${e.id}>
            ${e.description}
        </echo_${e.id}>
        `
    ).join("\n");

    return `Based on the echo description, user action and current contexts provided decide which echo should be resolved now.

        <current_context>
            location: ${ctx.protagonistLocation}
            protagonist state: ${ctx.protagonistState}
            ${recentContext}
        </current_context>

        <current_user_action>
            ${ctx.userAction}
        </current_user_action>

        <pending_echoes>
            ${echoList}
        </pending_echoes>

        <rule>
            An echo should trigger if:
            <point_1>
                The timing feels narratively appropriate
            </point_1>
            <point_2>
                It would enhance the story (not disrupt it)
            </point_2>    
        </rule>

        Be selective, not every echo needs to trigger. Surprise is better than predictability.
        Return ONLY the IDs of echoes that should trigger now.
    `;
}