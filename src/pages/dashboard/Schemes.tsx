import { useEffect, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Scheme = {
  id: string; name: string; category: string; description: string;
  eligibility: string | null; benefits: string | null; apply_link: string | null; ministry: string | null;
};

const Schemes = () => {
  const { t } = useI18n();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [q, setQ] = useState("");
  const [recommending, setRecommending] = useState(false);
  const [recommended, setRecommended] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("government_schemes").select("*").order("name").then(({ data }) => setSchemes((data || []) as Scheme[]));
  }, []);

  const filtered = schemes.filter(
    (s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase())
  );

  const recommend = async () => {
    setRecommending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", session!.user.id).maybeSingle();
      const resp = await supabase.functions.invoke("recommend-schemes", { body: { profile } });
      if (resp.error) throw resp.error;
      setRecommended(resp.data?.schemeNames || []);
      toast.success("Personalised recommendations ready!");
    } catch (err) {
      toast.error("Could not get recommendations. Update your profile first.");
    } finally { setRecommending(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t("schemes")}</h1>
          <p className="mt-1 text-muted-foreground">Discover government programs for rural India.</p>
        </div>
        <Button onClick={recommend} disabled={recommending} className="bg-gradient-warm shadow-glow">
          ✨ {recommending ? "…" : "AI Recommend for me"}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search schemes…" className="pl-9" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((s) => {
          const isRec = recommended.includes(s.name);
          return (
            <Card key={s.id} className={`relative bg-gradient-card p-6 shadow-soft transition-smooth hover:shadow-elevated ${isRec ? "ring-2 ring-accent" : ""}`}>
              {isRec && <Badge className="absolute right-4 top-4 bg-accent text-accent-foreground">✨ Recommended</Badge>}
              <Badge variant="secondary" className="mb-2">{s.category}</Badge>
              <h3 className="font-display text-lg font-semibold text-foreground">{s.name}</h3>
              {s.ministry && <p className="text-xs text-muted-foreground">{s.ministry}</p>}
              <p className="mt-3 text-sm text-foreground/80">{s.description}</p>
              {s.eligibility && (<p className="mt-2 text-xs"><span className="font-semibold text-primary">Eligibility:</span> {s.eligibility}</p>)}
              {s.benefits && (<p className="mt-1 text-xs"><span className="font-semibold text-primary">Benefits:</span> {s.benefits}</p>)}
              {s.apply_link && (
                <a href={s.apply_link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Apply <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Schemes;