import { FormEvent, useEffect, useState } from "react";
import { Calendar, MapPin, Minus, Plus, ShoppingBasket, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Rate = {
  id: string;
  vegetable: string;
  price_per_kg: number;
  market_name: string;
  district: string | null;
  state: string | null;
  rate_date: string;
  notes: string | null;
};

const SEED_RATES: Rate[] = [
  { id: "s1", vegetable: "Tomato", price_per_kg: 12, market_name: "Azadpur Mandi", district: "North Delhi", state: "Delhi", rate_date: new Date().toISOString(), notes: "Fresh stock, good quality" },
  { id: "s2", vegetable: "Onion", price_per_kg: 18, market_name: "Lasalgaon Mandi", district: "Nashik", state: "Maharashtra", rate_date: new Date().toISOString(), notes: "Medium size, dry variety" },
  { id: "s3", vegetable: "Potato", price_per_kg: 10, market_name: "Agra Mandi", district: "Agra", state: "Uttar Pradesh", rate_date: new Date().toISOString(), notes: "Jyoti variety, bulk available" },
  { id: "s4", vegetable: "Spinach", price_per_kg: 8, market_name: "Koyambedu Market", district: "Chennai", state: "Tamil Nadu", rate_date: new Date().toISOString(), notes: null },
  { id: "s5", vegetable: "Cauliflower", price_per_kg: 14, market_name: "Bowenpally Market", district: "Hyderabad", state: "Telangana", rate_date: new Date().toISOString(), notes: "White, firm heads" },
];

const getAffordability = (price: number) => {
  if (price <= 10) return { label: "Very Affordable", className: "bg-emerald-100 text-emerald-900" };
  if (price <= 20) return { label: "Affordable", className: "bg-teal-100 text-teal-900" };
  if (price <= 35) return { label: "Moderate", className: "bg-amber-100 text-amber-900" };
  return { label: "Premium", className: "bg-rose-100 text-rose-900" };
};

const getTrend = (price: number) => {
  if (price <= 10) return "down";
  if (price >= 35) return "up";
  return "stable";
};

const Mandi = () => {
  const { t } = useI18n();
  const [rates, setRates] = useState<Rate[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vegetable: "", price_per_kg: "", market_name: "", district: "", state: "", notes: "" });
  const [filter, setFilter] = useState<"all" | "affordable" | "moderate" | "premium">("all");

  const load = async () => {
    const { data } = await supabase.from("mandi_rates").select("*").order("rate_date", { ascending: false }).limit(50);
    const dbRates = (data || []) as Rate[];
    setRates(dbRates.length > 0 ? dbRates : SEED_RATES);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.vegetable.trim() || !form.price_per_kg || !form.market_name.trim()) {
      toast.error("Vegetable, price and market are required");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("mandi_rates").insert({
      user_id: session!.user.id,
      vegetable: form.vegetable.trim(),
      price_per_kg: parseFloat(form.price_per_kg),
      market_name: form.market_name.trim(),
      district: form.district.trim() || null,
      state: form.state.trim() || null,
      notes: form.notes.trim() || null,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Rate added");
    setForm({ vegetable: "", price_per_kg: "", market_name: "", district: "", state: "", notes: "" });
    setOpen(false);
    load();
  };

  const filtered = rates.filter((rate) => {
    if (filter === "affordable") return rate.price_per_kg <= 20;
    if (filter === "moderate") return rate.price_per_kg > 20 && rate.price_per_kg <= 35;
    if (filter === "premium") return rate.price_per_kg > 35;
    return true;
  });

  const avgPrice = rates.length ? (rates.reduce((sum, rate) => sum + rate.price_per_kg, 0) / rates.length).toFixed(1) : "-";
  const cheapest = rates.length ? rates.reduce((a, b) => (a.price_per_kg < b.price_per_kg ? a : b)) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 page-header">
        <div>
          <span className="ambient-chip">Market prices</span>
          <h1 className="page-title">{t("mandi")}</h1>
          <p className="page-subtitle">A brighter mandi screen with layered stats, cleaner pricing cards and more attractive type.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-warm font-accent shadow-glow"><Plus className="mr-1 h-4 w-4" />{t("addRate")}</Button>
          </DialogTrigger>
          <DialogContent className="ambient-panel-strong border-white/60">
            <DialogHeader><DialogTitle className="font-display text-2xl">{t("addRate")}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="font-accent">{t("vegetable")} *</Label><Input className="ambient-input" value={form.vegetable} maxLength={50} onChange={(e) => setForm({ ...form, vegetable: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label className="font-accent">{t("pricePerKg")} *</Label><Input className="ambient-input" type="number" step="0.01" min="0" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} required /></div>
              </div>
              <div className="space-y-1.5"><Label className="font-accent">{t("market")} *</Label><Input className="ambient-input" value={form.market_name} maxLength={100} onChange={(e) => setForm({ ...form, market_name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="font-accent">{t("district")}</Label><Input className="ambient-input" value={form.district} maxLength={50} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="font-accent">{t("state")}</Label><Input className="ambient-input" value={form.state} maxLength={50} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label className="font-accent">Notes</Label><Textarea className="ambient-input" rows={2} maxLength={300} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="ambient-input" onClick={() => setOpen(false)}>{t("cancel")}</Button>
                <Button type="submit" className="bg-gradient-warm font-accent">{t("save")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Listings", value: rates.length, color: "text-emerald-700" },
          { label: "Avg Price/kg", value: `Rs ${avgPrice}`, color: "text-teal-700" },
          { label: "Cheapest Today", value: cheapest ? `Rs ${cheapest.price_per_kg} ${cheapest.vegetable}` : "-", color: "text-amber-700" },
          { label: "Markets Covered", value: new Set(rates.map((rate) => rate.market_name)).size, color: "text-violet-700" },
        ].map((summary, index) => (
          <Card key={summary.label} className="ambient-panel p-4" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="font-accent text-xs uppercase tracking-[0.18em] text-muted-foreground">{summary.label}</div>
            <div className={`mt-2 font-display text-2xl font-bold ${summary.color}`}>{summary.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "affordable", "moderate", "premium"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-2 text-sm font-accent font-semibold transition ${
              filter === value ? "bg-primary text-primary-foreground shadow-soft" : "border border-white/60 bg-white/70 text-foreground"
            }`}
          >
            {value === "all" ? "All" : value === "affordable" ? "<= Rs 20/kg" : value === "moderate" ? "Rs 21-35/kg" : "> Rs 35/kg"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="ambient-panel flex flex-col items-center justify-center p-12 text-center">
          <ShoppingBasket className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No rates in this range yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rate, index) => {
            const afford = getAffordability(rate.price_per_kg);
            const trend = getTrend(rate.price_per_kg);
            return (
              <Card key={rate.id} className="ambient-panel p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold capitalize text-foreground">{rate.vegetable}</h3>
                    <p className="text-sm text-muted-foreground">{rate.market_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl font-bold text-primary">Rs {rate.price_per_kg}</div>
                    <div className="text-xs text-muted-foreground">per kg</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-accent font-bold uppercase tracking-[0.14em] ${afford.className}`}>{afford.label}</span>
                  <span className={`flex items-center gap-1 text-xs font-accent font-semibold ${trend === "down" ? "text-emerald-700" : trend === "up" ? "text-rose-700" : "text-muted-foreground"}`}>
                    {trend === "down" ? <TrendingDown className="h-4 w-4" /> : trend === "up" ? <TrendingUp className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    {trend === "down" ? "Falling" : trend === "up" ? "Rising" : "Stable"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {(rate.district || rate.state) && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[rate.district, rate.state].filter(Boolean).join(", ")}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(rate.rate_date).toLocaleDateString()}</span>
                </div>
                {rate.notes && <p className="mt-3 text-sm italic text-foreground/70">{rate.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Mandi;
