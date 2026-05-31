import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.log("Make sure .env.local is in the same folder as package.json");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const userId = process.argv[2];
const newPassword = process.argv[3];

if (!userId || !newPassword) {
  console.log("Usage:");
  console.log("node scripts/reset-password.mjs USER_ID newPassword123");
  process.exit(1);
}

const { error } = await supabase.auth.admin.updateUserById(userId, {
  password: newPassword,
});

if (error) {
  console.error("Password reset failed:", error.message);
  process.exit(1);
}

console.log("Password reset successfully!");