import { ChatOpenAI } from "@langchain/openai";
import {config} from "dotenv"
import { HumanMessage, SystemMessage } from "langchain";
import { get_prompt } from "./Prompt/continue";
import { INITIAL_PROMPT_PROPS, MODEL_PROPS } from "./types/types";
import { get_initial_prompt } from "./Prompt/initialize";
import z from "zod";

config();

const result = z.object({
    narration: z.string().describe("The narration continuing the given contex"),
    changes: z.object({
        isStoryEnd: z.boolean().optional().describe("Has story ended based on the current context, if health becomes 0 then True"),
        traits: z.array(z.string()).optional().describe("Changes traits , if any"),
        inventory: z.array(z.string()).optional().describe("Changes in inventory , if any"),
        health: z.number().min(0).max(100).optional().describe("Change in health"),
        location: z.string().optional().describe("Change in location")
    }).optional().describe("Changes in the context of protagonist")
})

const model = new ChatOpenAI();

export async function continue_model_call(arg:MODEL_PROPS):Promise<z.infer<typeof result>>{

    const model_with_structured_output = model.withStructuredOutput(result);
    const {user_feed,context} = arg;

    const prompt = get_prompt(context);
    const messages = [
        new SystemMessage(prompt),
        new HumanMessage(user_feed)
    ];

    const response = await model_with_structured_output.invoke(messages);

    return response;
}

export async function initialise_model_call(arg:INITIAL_PROMPT_PROPS):Promise<string>{

    const prompt = get_initial_prompt(arg);
    const res = await model.invoke(prompt);

    return res.text;
}
