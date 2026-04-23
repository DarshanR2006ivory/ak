import { useEffect, useState } from "react";
import { Briefcase, MapPin, GraduationCap, Phone, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Job = {
  id: string; title: string; company: string; location: string;
  qualification_required: string; salary_range: string | null; job_type: string | null;
  description: string; contact: string | null;
};

const Jobs = () => {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [qual, setQual] = useState("");
  const [matched, setMatched] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("jobs").select("*").order("created_at", { ascending: false }).then(({ data }) => setJobs((data || []) as Job[]));
  }, []);

  const match = async () => {
    if (!qual.trim()) { toast.error("Enter your qualification"); return; }
    setBusy(true);
    try {
      const resp = await supabase.functions.invoke("recommend-jobs", { body: { qualification: qual } });
      if (resp.error) throw resp.error;
      setMatched(resp.data?.matchedTitles || []);
      toast.success("Personalised matches ready!");
    } catch { toast.error("Match failed"); }
    finally { setBusy(false); }
  };

  const sorted = matched.length ? [...jobs].sort((a, b) => Number(matched.includes(b.title)) - Number(matched.includes(a.title))) : jobs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t("jobs")}</h1>
        <p className="mt-1 text-muted-foreground">Opportunities across rural India — government, private, daily wage.</p>
      </div>

      <Card className="bg-gradient-card p-5 shadow-soft">
        <Label className="font-medium">{t("qualification")}</Label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input value={qual} onChange={(e) => setQual(e.target.value)} placeholder="e.g. 10th pass, ITI, Diploma in Civil…" maxLength={150} />
          <Button onClick={match} disabled={busy} className="bg-gradient-warm shadow-glow">
            <Sparkles className="mr-1 h-4 w-4" />{busy ? "…" : t("findJobs")}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((j) => {
          const isMatch = matched.includes(j.title);
          return (
            <Card key={j.id} className={`relative bg-gradient-card p-5 shadow-soft transition-smooth hover:shadow-elevated ${isMatch ? "ring-2 ring-accent" : ""}`}>
              {isMatch && <Badge className="absolute right-4 top-4 bg-accent text-accent-foreground">✨ Match</Badge>}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">{j.company}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {j.job_type && <Badge variant="secondary">{j.job_type}</Badge>}
                {j.salary_range && <Badge variant="outline" className="border-accent/40 text-accent">{j.salary_range}</Badge>}
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{j.location}</div>
                <div className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />{j.qualification_required}</div>
                {j.contact && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{j.contact}</div>}
              </div>
              <p className="mt-3 text-sm text-foreground/80">{j.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Jobs;