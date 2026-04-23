import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { qualification } = await req.json();
    if (typeof qualification !== "string" || !qualification.trim()) {
      return new Response(JSON.stringify({ error: "qualification required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: jobs } = await supabase.from("jobs").select("title, qualification_required, description");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You match rural Indian jobs to user qualifications. Be inclusive — even partial matches count." },
          { role: "user", content: `User qualification: "${qualification}"\n\nJobs:\n${JSON.stringify(jobs || [])}\n\nReturn job titles that match the user's qualification or that they could realistically apply for.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "match",
            description: "Return matching job titles",
            parameters: {
              type: "object",
              properties: { matchedTitles: { type: "array", items: { type: "string" } } },
              required: ["matchedTitles"], additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "match" } },
      }),
    });

    if (!resp.ok) { console.error(await resp.text()); throw new Error("AI failed"); }
    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { matchedTitles: [] };
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});