import { ChangeEvent, useState } from "react";
import { Loader2, Sprout, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Farming = () => {
  const { t, lang } = useI18n();
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setAnalysis("");
  };

  const analyze = async () => {
    if (!preview) return;
    setBusy(true);
    setAnalysis("");
    try {
      const resp = await supabase.functions.invoke("analyze-crop", { body: { imageDataUrl: preview, lang } });
      if (resp.error) throw resp.error;
      setAnalysis(resp.data?.analysis || "No analysis returned.");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <span className="ambient-chip">Field analysis</span>
        <h1 className="page-title">{t("farming")}</h1>
        <p className="page-subtitle">A more inviting crop diagnosis page with better upload focus, warmer type, and clearer AI analysis output.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="ambient-panel-strong p-6">
          <label className="group flex aspect-video cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-border/80 bg-white/45 text-muted-foreground transition-smooth hover:border-primary hover:bg-secondary/80">
            {preview ? (
              <img src={preview} alt="Crop" className="h-full w-full rounded-[1.5rem] object-cover" />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-10 w-10 transition-smooth group-hover:scale-110 group-hover:text-primary" />
                <p className="mt-3 font-accent text-sm font-semibold uppercase tracking-[0.18em]">{t("uploadPhoto")}</p>
                <p className="mt-2 text-xs">PNG or JPG up to 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
          </label>

          <div className="mt-4 flex gap-2">
            <Button onClick={analyze} disabled={!preview || busy} className="flex-1 bg-gradient-warm font-accent shadow-glow">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing
                </>
              ) : (
                <>
                  <Sprout className="mr-2 h-4 w-4" /> {t("analyze")}
                </>
              )}
            </Button>
            {preview && (
              <Button variant="outline" onClick={() => { setPreview(null); setAnalysis(""); }} className="ambient-input">
                Clear
              </Button>
            )}
          </div>
        </Card>

        <Card className="ambient-panel-strong p-6">
          <div className="font-accent text-xs uppercase tracking-[0.24em] text-primary">AI diagnosis</div>
          <h3 className="mt-2 font-display text-2xl font-semibold">Crop health summary</h3>
          {analysis ? (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-foreground/90">{analysis}</div>
          ) : (
            <p className="mt-4 text-sm leading-8 text-muted-foreground">
              Upload a crop, leaf or pest image to receive instant disease clues, treatment options and simple care tips.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Farming;
