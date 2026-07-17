// Script to add genre column to ratings table using Supabase service client
// Run: node scripts/migrate-genre.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Check if column already exists by querying a row
const { data, error } = await supabase
  .from("ratings")
  .select("genre")
  .limit(1);

if (error) {
  if (error.message.includes("column") && error.message.includes("genre")) {
    console.log("Column does not exist. Adding it...");
    // Use the Supabase SQL API
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Need to add column via Supabase dashboard SQL editor.");
    console.log("Please run this SQL in Supabase Studio > SQL Editor:");
    console.log("\nALTER TABLE ratings ADD COLUMN IF NOT EXISTS genre text DEFAULT NULL;\n");
  } else {
    console.error("Unexpected error:", error.message);
  }
} else {
  console.log("✅ genre column already exists in ratings table!");
  console.log("Sample data:", data);
}
