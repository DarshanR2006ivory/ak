import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Briefcase, FileText, MessageCircle, ShoppingBasket, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { t } = useI18n();
  const [stats, setStats] = useState({ schemes: 0, jobs: 0, alerts: 0, rates: 0 });

  useEffect(() => {
    (async () => {
      const [s, j, a, r] = await Promise.all([
        supabase.from("government_schemes").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("emergency_alerts").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("mandi_rates").select("id", { count: "exact", head: true }),
      ]);
      setStats({ schemes: s.count || 0, jobs: j.count || 0, alerts: a.count || 0, rates: r.count || 0 });
    })();
  }, []);

  const tiles = [
    { to: "/app/chat", icon: MessageCircle, title: t("aiChat"), desc: "Ask anything in a calmer, more readable chat workspace.", grad: "from-emerald-500 to-teal-600" },
    { to: "/app/schemes", icon: FileText, title: t("schemes"), desc: `${stats.schemes} schemes surfaced with simpler summaries.`, grad: "from-amber-500 to-orange-600" },
    { to: "/app/farming", icon: Sprout, title: t("farming"), desc: "Upload a crop image for AI diagnosis and treatment steps.", grad: "from-lime-500 to-green-600" },
    { to: "/app/mandi", icon: ShoppingBasket, title: t("mandi"), desc: `${stats.rates} shared prices with a fresher market overview.`, grad: "from-orange-500 to-red-500" },
    { to: "/app/jobs", icon: Briefcase, title: t("jobs"), desc: `${stats.jobs} opportunities ranked around your qualifications.`, grad: "from-blue-500 to-indigo-600" },
    { to: "/app/alerts", icon: AlertTriangle, title: t("alerts"), desc: `${stats.alerts} active warnings presented with stronger signal.`, grad: "from-rose-500 to-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <span className="ambient-chip">Daily overview</span>
        <h1 className="page-title">{t("welcome")}</h1>
        <p className="page-subtitle">A more animated dashboard with warmer panels, clearer typography and faster paths into every rural service.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile, index) => (
          <Link key={tile.to} to={tile.to} className="animate-slide-up" style={{ animationDelay: `${index * 70}ms` }}>
            <Card className="ambient-panel group relative overflow-hidden p-6 transition-smooth hover:-translate-y-1 hover:shadow-elevated">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tile.grad} text-white shadow-soft`}>
                <tile.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{tile.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{tile.desc}</p>
              <ArrowRight className="absolute right-5 top-6 h-4 w-4 text-muted-foreground opacity-0 transition-smooth group-hover:translate-x-1 group-hover:opacity-100" />
            </Card>
          </Link>
        ))}
      </div>

      <Card className="ambient-panel-strong overflow-hidden p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3 font-accent">Featured</Badge>
            <h3 className="font-display text-2xl font-bold">Try the AI assistant first</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground/80">
              It can explain scheme eligibility, crop symptoms, weather concerns and nearby work opportunities in a single conversation.
            </p>
          </div>
          <div className="ambient-chip">Fast start</div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
