const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.log("Missing Supabase environment variables.");
  console.log("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY before running this seed script.");
  process.exit(1);
}

async function main() {
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const accounts = [
    { email: "marie-laure@loveshare.app", password: "1512", user_metadata: { full_name: "Marie-Laure" } },
    { email: "william@loveshare.app", password: "2709", user_metadata: { full_name: "William" } },
  ];

  for (const account of accounts) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: account.user_metadata,
    });

    if (error) {
      console.log(`Unable to create ${account.email}: ${error.message}`);
    } else {
      console.log(`Created ${account.email} as ${data.user?.id}`);
    }
  }

  const categories = ["Date Ideas", "Groceries", "Travel", "Gifts", "Memories", "Household", "Random Thoughts"];
  for (const category of categories) {
    await supabase.from("categories").upsert({ name: category, color: "#ef4444" });
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
