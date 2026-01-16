import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../../../../.env") });

export const CREDITS_MAP: Record<string, number> = {
    [process.env.TEST_PRODUCT_ID!]: 1000,
    [process.env.STARTER_PRODUCT_ID!]: 2000,
    [process.env.EXPLORER_PRODUCT_ID!]: 4000,
    [process.env.STORYTELLER_PRODUCT_ID!]: 8000,
    [process.env.AUTHOR_PRODUCT_ID!]: 20000,
};