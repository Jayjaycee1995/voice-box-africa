# How to Deploy the delete-user Edge Function

## Step 1: Open Supabase Functions Dashboard
Go to: https://supabase.com/dashboard/project/gpxzgdeykpztufaikfvk/functions

## Step 2: Create New Function
Click the **"New function"** button (usually a blue button in the top-right corner)

## Step 3: Configure the Function
In the form that appears:
- **Name:** `delete-user`
- **Runtime:** Select **Deno**
- **Entry point:** `index.ts`

## Step 4: Paste the Code
Copy ALL of the code below and paste it into the code editor:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the caller is an authenticated admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Use the caller's JWT to verify they are an admin
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the caller's profile to confirm admin role
    const { data: callerProfile, error: profileError } = await callerClient
      .from("users")
      .select("role")
      .eq("id", callerUser.id)
      .single();

    if (profileError || callerProfile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the target user ID from the request body
    const { userId } = await req.json() as { userId: string };
    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent an admin from deleting themselves
    if (userId === callerUser.id) {
      return new Response(JSON.stringify({ error: "Cannot delete your own account" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the service-role client to delete related rows then the auth user
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Delete child rows in dependency order to avoid FK violations
    const tables: Array<{ table: string; column: string | string[] }> = [
      { table: "messages",    column: ["sender_id", "receiver_id"] },
      { table: "proposals",   column: "talent_id" },
      { table: "invitations", column: "talent_id" },
      { table: "demos",       column: "talent_id" },
      { table: "gigs",        column: "client_id" },
    ];

    for (const { table, column } of tables) {
      if (Array.isArray(column)) {
        // Delete rows where the user appears in any of the listed columns
        for (const col of column) {
          const { error } = await adminClient.from(table).delete().eq(col, userId);
          if (error) console.error(`Error deleting from ${table} (${col}):`, error.message);
        }
      } else {
        const { error } = await adminClient.from(table).delete().eq(column, userId);
        if (error) console.error(`Error deleting from ${table} (${column}):`, error.message);
      }
    }

    // Delete the public users row
    await adminClient.from("users").delete().eq("id", userId);

    // Finally delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

## Step 5: Deploy
Click the **"Create function"** or **"Deploy"** button.

## Step 6: Verify
You should see `delete-user` listed in your Functions dashboard.

---

That's it! The function is now live and your Admin Panel delete button will work.
