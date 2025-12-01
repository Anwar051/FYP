// drizzle.config.js
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./configs/schema.js",   // <-- adjust if your path differs
  out: "./drizzle",
  dialect: "postgresql",           // <-- REQUIRED (replaces old "driver")
  dbCredentials: {
    url: process.env.DATABASE_URL, // <-- make sure this is set
  },
  // optional:
  // strict: true,
  // verbose: true,
});
