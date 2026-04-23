import { useEffect, useState } from "react";
import { AlertTriangle, CloudRain, Bug, HeartPulse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

type Alert = {
  id: string; title: string; alert_type: string; severity: string;
  region: string | null; message: string; expires_at: string | null; created_at: string;
};

const iconFor = (type: string) => {
  if (type.toLowerCase() === "weather") return CloudRain;
  if (type.toLowerCase() === "pest") return Bug;
  if (type.toLowerCase() === "health") return HeartPulse;
  return AlertTriangle;
};

const severityClass = (sev: string) => {
  if (sev === "high") return "border-l-destructive bg-destructive/5";
  if (sev === "medium") return "border-l-accent bg-accent/5";
  return "border-l-primary bg-primary/5";
};

const Alerts = () => {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    supabase.from("emergency_alerts").select("*").eq("active", true).order("created_at", { ascending: false }).then(({ data }) => setAlerts((data || []) as Alert[]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t("alerts")}</h1>
        <p className="mt-1 text-muted-foreground">Live warnings about weather, pests, health and more.</p>
      </div>

      <div className="space-y-4">
        {alerts.map((a) => {
          const Icon = iconFor(a.alert_type);
          return (
            <Card key={a.id} className={`flex gap-4 border-l-4 p-5 shadow-soft ${severityClass(a.severity)}`}>
              <div className="mt-0.5"><Icon className="h-6 w-6 text-foreground" /></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-foreground">{a.title}</h3>
                  <Badge variant="outline" className="capitalize">{a.alert_type}</Badge>
                  <Badge className={a.severity === "high" ? "bg-destructive text-destructive-foreground" : a.severity === "medium" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}>
                    {a.severity}
                  </Badge>
                </div>
                {a.region && <p className="mt-1 text-xs text-muted-foreground">📍 {a.region}</p>}
                <p className="mt-2 text-sm text-foreground/90">{a.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </Card>
          );
        })}
        {alerts.length === 0 && (
          <Card className="bg-gradient-card p-12 text-center shadow-soft">
            <p className="text-muted-foreground">No active alerts right now. Stay safe! 🌿</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Alerts;