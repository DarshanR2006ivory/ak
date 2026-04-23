import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { profile } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: schemes } = await supabase.from("government_schemes").select("name, category, eligibility, description");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You match Indian government schemes to user profiles. Reply via the recommend tool only." },
          { role: "user", content: `User profile: ${JSON.stringify(profile || {})}\n\nSchemes:\n${JSON.stringify(schemes || [])}\n\nPick the 3-5 most relevant scheme names for this user.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend",
            description: "Return matching scheme names",
            parameters: {
              type: "object",
              properties: { schemeNames: { type: "array", items: { type: "string" } } },
              required: ["schemeNames"], additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend" } },
      }),
    });

    if (!resp.ok) { console.error(await resp.text()); throw new Error("AI failed"); }
    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { schemeNames: [] };
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});