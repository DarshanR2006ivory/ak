import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageCircle, FileText, Sprout, ShoppingBasket, Briefcase, AlertTriangle, ArrowRight } from "lucide-react";
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
    { to: "/app/chat", icon: MessageCircle, title: t("aiChat"), desc: "Talk to your AI assistant", grad: "from-emerald-500 to-teal-600" },
    { to: "/app/schemes", icon: FileText, title: t("schemes"), desc: `${stats.schemes} schemes available`, grad: "from-amber-500 to-orange-600" },
    { to: "/app/farming", icon: Sprout, title: t("farming"), desc: "Upload a crop photo", grad: "from-lime-500 to-green-600" },
    { to: "/app/mandi", icon: ShoppingBasket, title: t("mandi"), desc: `${stats.rates} community rates`, grad: "from-orange-500 to-red-500" },
    { to: "/app/jobs", icon: Briefcase, title: t("jobs"), desc: `${stats.jobs} open positions`, grad: "from-blue-500 to-indigo-600" },
    { to: "/app/alerts", icon: AlertTriangle, title: t("alerts"), desc: `${stats.alerts} active alerts`, grad: "from-rose-500 to-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t("welcome")} 👋</h1>
        <p className="mt-1 text-muted-foreground">Choose a service to get started.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to}>
            <Card className="group relative overflow-hidden border-border bg-gradient-card p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elevated">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tile.grad} text-white shadow-soft`}>
                <tile.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{tile.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tile.desc}</p>
              <ArrowRight className="absolute right-5 top-6 h-4 w-4 text-muted-foreground opacity-0 transition-smooth group-hover:translate-x-1 group-hover:opacity-100" />
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-gradient-warm p-6 text-primary-foreground shadow-glow">
        <Badge variant="secondary" className="mb-3">Tip</Badge>
        <h3 className="font-display text-xl font-bold">Try the AI assistant</h3>
        <p className="mt-1 text-sm text-white/90">Ask in your own language about anything — farming techniques, scheme eligibility, weather advice and more.</p>
      </Card>
    </div>
  );
};

export default Dashboard;