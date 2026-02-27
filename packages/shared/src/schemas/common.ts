import { z } from "zod";

export const storyModeSchema = z.enum([
    "protagonist",
    "narrator"
]);

export const storyStatusSchema = z.enum([
    "active",
    "completed",
    "abandoned"
]);

export const storyVisibilitySchema = z.enum([
    "private",
    "public",
    "unlisted"
]);

export const genres = [
    "Action and Adventure",
    "Science Fiction",
    "Science Fantasy",
    "Romance",
    "Horror",
    "Fantasy",
    "Superhero",
    "Comedy",
    "Crime and Mystery"
] as const;

export type Genre = (typeof genres)[number];
export type GenreFilter = Genre | 'All';


export const suggestedTraits = [
    "optimistic",
    "cynical",
    "brave",
    "cautious",
    "merciful",
    "ruthless",
    "curious",
    "suspicious",
    "charismatic",
    "reserved",
    "loyal",
    "independent",
    "impulsive",
    "calculating",
    "compassionate",
    "detached",
] as const;

// Why not use z.enum(suggestedTraits) instead?
// Because suggestedTraits are suggestions, not requirements!

export const traitSchema = z.string().min(1, "Trait cannot be empty").max(100);
export const traitsArraySchema = z.array(traitSchema).max(5, "Maximum 5 traits allowed");


export type StoryMode = z.infer<typeof storyModeSchema>;
export type StoryStatus = z.infer<typeof storyStatusSchema>;
export type StoryVisibility = z.infer<typeof storyVisibilitySchema>;
export type SuggestedTrait = (typeof suggestedTraits)[number];


// [number] - The Index Access
// This is the magic part! [number] means "give me the type of any element at a numeric index".

// type MyArray = ["optimistic", "cynical", "brave"];
// type Element = MyArray[number];
// Result: "optimistic" | "cynical" | "brave"

// It's like doing:
// type Element = MyArray[0] | MyArray[1] | MyArray[2];
