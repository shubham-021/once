import { z } from "zod";
import { genres, storyModeSchema, traitsArraySchema } from "./common"

export const castModeSchema = z.enum(["strict", "flexible"]).default("flexible");

export const castMemberSchema = z.object({
    name: z.string().min(1, "Name required").max(100),
    description: z.string().max(500)
})

export const createStorySchema = z.object({
    title: z.string().min(1, "Title is required").max(30, "Title can not be more than 30 characters"),
    genre: z.enum(genres, { errorMap: () => ({ message: "Please select a genre" }) }),
    storyMode: storyModeSchema.default("protagonist"),
    storyIdea: z.string().min(20, "Story idea/ plot must be at least 20 characters"),
    worldDescription: z.string().optional(),
    promptForOnce: z.string().optional(),
    startingScene: z.string().optional(),
    cast: z.array(castMemberSchema).optional(),
    castMode: castModeSchema,
    protagonist: z.object({
        name: z.string().min(1).max(100),
        description: z.string(),
        traits: traitsArraySchema.default([]),
    }).optional()
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;