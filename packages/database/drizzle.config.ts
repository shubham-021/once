import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    dbCredentials: {
        url: Bun.env.DATABASE_URL!
    },
    schema: "./src/schema.ts",
    out: "./drizzle",
});
