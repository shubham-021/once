import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../../../.env") });

const FE_URL = process.env.FRONTEND_URL!
const STRTR_PD_ID = process.env.STARTER_PRODUCT_ID!
const EXP_PD_ID = process.env.EXPLORER_PRODUCT_ID!
const STORY_PD_ID = process.env.STORYTELLER_PRODUCT_ID!
const AT_PD_ID = process.env.AUTHOR_PRODUCT_ID!
const TEST_PD_ID = process.env.TEST_PRODUCT_ID!
const DODO_API_KEY = process.env.DODO_PAYMENT_API_KEY

export { FE_URL, STRTR_PD_ID, STORY_PD_ID, EXP_PD_ID, AT_PD_ID, TEST_PD_ID, DODO_API_KEY }