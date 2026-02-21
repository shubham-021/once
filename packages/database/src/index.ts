import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"
import * as authSchema from "./auth-schema"
import { config } from "dotenv";
import { resolve } from "path";

config({ path: '../../.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema: { ...schema, ...authSchema } });
export type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export * from "./schema"
export * from "./auth-schema"
export { eq, desc, asc, inArray, and, count, lte, gte } from "drizzle-orm";