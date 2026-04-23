import { FormEvent, useEffect, useState } from "react";
import { Plus, ShoppingBasket, MapPin, Calendar, TrendingDown, TrendingUp, Minus } from "lucide-react";
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
  id: string; vegetable: string; price_per_kg: number; market_name: string;
  district: string | null; state: string | null; rate_date: string; notes: string | null;
};

// Affordable seed data — real-world typical mandi prices
const SEED_RATES: Rate[] = [
  { id: "s1", vegetable: "Tomato", price_per_kg: 12, market_name: "Azadpur Mandi", district: "North Delhi", state: "Delhi", rate_date: new Date().toISOString(), notes: "Fresh stock, good quality" },
  { id: "s2", vegetable: "Onion", price_per_kg: 18, market_name: "Lasalgaon Mandi", district: "Nashik", state: "Maharashtra", rate_date: new Date().toISOString(), notes: "Medium size, dry variety" },
  { id: "s3", vegetable: "Potato", price_per_kg: 10, market_name: "Agra Mandi", district: "Agra", state: "Uttar Pradesh", rate_date: new Date().toISOString(), notes: "Jyoti variety, bulk available" },
  { id: "s4", vegetable: "Spinach", price_per_kg: 8, market_name: "Koyambedu Market", district: "Chennai", state: "Tamil Nadu", rate_date: new Date().toISOString(), notes: null },
  { id: "s5", vegetable: "Cauliflower", price_per_kg: 14, market_name: "Bowenpally Market", district: "Hyderabad", state: "Telangana", rate_date: new Date().toISOString(), notes: "White, firm heads" },
  { id: "s6", vegetable: "Brinjal", price_per_kg: 9, market_name: "Koley Market", district: "Kolkata", state: "West Bengal", rate_date: new Date().toISOString(), notes: null },
  { id: "s7", vegetable: "Cabbage", price_per_kg: 7, market_name: "Yeshwanthpur APMC", district: "Bengaluru", state: "Karnataka", rate_date: new Date().toISOString(), notes: "Large heads, good for bulk" },
  { id: "s8", vegetable: "Carrot", price_per_kg: 16, market_name: "Vashi APMC", district: "Navi Mumbai", state: "Maharashtra", rate_date: new Date().toISOString(), notes: "Nantes variety" },
  { id: "s9", vegetable: "Bitter Gourd", price_per_kg: 22, market_name: "Gultekdi Market", district: "Pune", state: "Maharashtra", rate_date: new Date().toISOString(), notes: null },
  { id: "s10", vegetable: "Garlic", price_per_kg: 45, market_name: "Neemuch Mandi", district: "Neemuch", state: "Madhya Pradesh", rate_date: new Date().toISOString(), notes: "Desi variety, strong aroma" },
  { id: "s11", vegetable: "Ginger", price_per_kg: 38, market_name: "Tura Market", district: "Tura", state: "Meghalaya", rate_date: new Date().toISOString(), notes: "Fresh, high moisture" },
  { id: "s12", vegetable: "Green Chilli", price_per_kg: 20, market_name: "Guntur Mandi", district: "Guntur", state: "Andhra Pradesh", rate_date: new Date().toISOString(), notes: "Spicy variety" },
  { id: "s13", vegetable: "Pumpkin", price_per_kg: 6, market_name: "Patna Sabzi Mandi", district: "Patna", state: "Bihar", rate_date: new Date().toISOString(), notes: "Very affordable, large size" },
  { id: "s14", vegetable: "Bottle Gourd", price_per_kg: 5, market_name: "Jaipur Mandi", district: "Jaipur", state: "Rajasthan", rate_date: new Date().toISOString(), notes: "Cheapest of the season" },
  { id: "s15", vegetable: "Drumstick", price_per_kg: 30, market_name: "Madurai Market", district: "Madurai", state: "Tamil Nadu", rate_date: new Date().toISOString(), notes: "Tender, long pods" },
];

// Affordability thresholds (₹ per kg)
const getAffordability = (price: number) => {
  if (price <= 10) return { label: "Very Affordable", color: "#16a34a", bg: "#dcfce7" };
  if (price <= 20) return { label: "Affordable", color: "#0d9488", bg: "#ccfbf1" };
  if (price <= 35) return { label: "Moderate", color: "#d97706", bg: "#fef3c7" };
  return { label: "Premium", color: "#dc2626", bg: "#fee2e2" };
};

const getTrend = (price: number) => {
  // Simulate trend based on price range for demo
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
    // Show seed data if DB is empty
    setRates(dbRates.length > 0 ? dbRates : SEED_RATES);
  };

  useEffect(() => { load(); }, []);

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
    if (error) { toast.error(error.message); return; }
    toast.success("Rate added");
    setForm({ vegetable: "", price_per_kg: "", market_name: "", district: "", state: "", notes: "" });
    setOpen(false);
    load();
  };

  const filtered = rates.filter(r => {
    if (filter === "affordable") return r.price_per_kg <= 20;
    if (filter === "moderate") return r.price_per_kg > 20 && r.price_per_kg <= 35;
    if (filter === "premium") return r.price_per_kg > 35;
    return true;
  });

  const avgPrice = rates.length ? (rates.reduce((s, r) => s + r.price_per_kg, 0) / rates.length).toFixed(1) : "—";
  const cheapest = rates.length ? rates.reduce((a, b) => a.price_per_kg < b.price_per_kg ? a : b) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t("mandi")}</h1>
          <p className="mt-1 text-muted-foreground">Community-shared vegetable prices from markets across India.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-warm shadow-glow"><Plus className="mr-1 h-4 w-4" />{t("addRate")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("addRate")}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>{t("vegetable")} *</Label><Input value={form.vegetable} maxLength={50} onChange={(e) => setForm({ ...form, vegetable: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>{t("pricePerKg")} *</Label><Input type="number" step="0.01" min="0" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} required /></div>
              </div>
              <div className="space-y-1.5"><Label>{t("market")} *</Label><Input value={form.market_name} maxLength={100} onChange={(e) => setForm({ ...form, market_name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>{t("district")}</Label><Input value={form.district} maxLength={50} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>{t("state")}</Label><Input value={form.state} maxLength={50} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={2} maxLength={300} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
                <Button type="submit" className="bg-gradient-warm">{t("save")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Listings", value: rates.length, color: "#16a34a" },
          { label: "Avg Price/kg", value: `₹${avgPrice}`, color: "#0d9488" },
          { label: "Cheapest Today", value: cheapest ? `₹${cheapest.price_per_kg} ${cheapest.vegetable}` : "—", color: "#d97706" },
          { label: "Markets Covered", value: new Set(rates.map(r => r.market_name)).size, color: "#7c3aed" },
        ].map((s) => (
          <Card key={s.label} className="bg-gradient-card p-4 shadow-soft">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "affordable", "moderate", "premium"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px", borderRadius: 999, border: "1.5px solid",
              borderColor: filter === f ? "#16a34a" : "#e5e7eb",
              background: filter === f ? "#16a34a" : "#fff",
              color: filter === f ? "#fff" : "#374151",
              fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {f === "all" ? "All" : f === "affordable" ? "≤ ₹20/kg" : f === "moderate" ? "₹21–35/kg" : "> ₹35/kg"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center bg-gradient-card p-12 text-center shadow-soft">
          <ShoppingBasket className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No rates in this range yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const afford = getAffordability(r.price_per_kg);
            const trend = getTrend(r.price_per_kg);
            return (
              <Card key={r.id} className="bg-gradient-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold capitalize text-foreground">{r.vegetable}</h3>
                    <p className="text-sm text-muted-foreground">{r.market_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold text-primary">₹{r.price_per_kg}</div>
                    <div className="text-xs text-muted-foreground">per kg</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span style={{ background: afford.bg, color: afford.color, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                    {afford.label}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: trend === "down" ? "#16a34a" : trend === "up" ? "#dc2626" : "#6b7280" }}>
                    {trend === "down" ? <TrendingDown size={14} /> : trend === "up" ? <TrendingUp size={14} /> : <Minus size={14} />}
                    {trend === "down" ? "Falling" : trend === "up" ? "Rising" : "Stable"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {(r.district || r.state) && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[r.district, r.state].filter(Boolean).join(", ")}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(r.rate_date).toLocaleDateString()}</span>
                </div>
                {r.notes && <p className="mt-2 text-xs text-foreground/70 italic">{r.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Mandi;
