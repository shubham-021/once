import  type { Genre } from "./common";

export type DiscoverResult = {
    id: string;
    title: string;
    author: string;
    genre: Genre;
    upvotes: number;
    description: string;
    publicDescription: string;
    turnCount: number;
}