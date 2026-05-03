/**
 * CampFire — Production Auth User Seeder
 * ========================================
 * Creates demo users in Supabase Auth via the Admin API.
 * Use this INSTEAD of the auth.users SQL block for hosted Supabase.
 *
 * Usage:
 *   npx tsx seed_auth_users.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SeedUser {
  id: string;
  username: string;
  email: string;
  password: string;
}

async function run() {
  const users: SeedUser[] = JSON.parse(fs.readFileSync("users.json", "utf-8"));
  console.log(`🔑  Creating ${users.length} users via Supabase Auth Admin API...`);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,      // auto-confirm for seed data
      user_metadata: {
        username: user.username,
        display_name: user.username,   // profiles trigger fills this properly
        date_of_birth: "1995-01-01",   // placeholder; update per user if needed
      },
    });

    if (error) {
      if (error.message.includes("already")) {
        skipped++;
      } else {
        console.error(`  ❌  ${user.email}: ${error.message}`);
      }
    } else {
      created++;
      process.stdout.write(`\r  ✅  Created ${created}/${users.length}`);
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n\n🎉  Done. Created: ${created}, Skipped (exists): ${skipped}`);
  console.log("Now run seed.sql in Supabase SQL Editor (skip the auth.users block).");
}

run().catch(console.error);
