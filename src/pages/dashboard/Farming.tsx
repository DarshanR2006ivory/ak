import { ChangeEvent, useState } from "react";
import { Upload, Sprout, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Farming = () => {
  const { t, lang } = useI18n();
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    setAnalysis("");
  };

  const analyze = async () => {
    if (!preview) return;
    setBusy(true); setAnalysis("");
    try {
      const resp = await supabase.functions.invoke("analyze-crop", { body: { imageDataUrl: preview, lang } });
      if (resp.error) throw resp.error;
      setAnalysis(resp.data?.analysis || "No analysis returned.");
    } catch {
      toast.error("Analysis failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t("farming")}</h1>
        <p className="mt-1 text-muted-foreground">Upload a photo of your crop, leaf or pest and our AI will diagnose issues and suggest remedies.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-card p-6 shadow-soft">
          <label className="group flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/50 text-muted-foreground transition-smooth hover:border-primary hover:bg-secondary">
            {preview ? (
              <img src={preview} alt="Crop" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-10 w-10 transition-smooth group-hover:scale-110 group-hover:text-primary" />
                <p className="mt-3 text-sm font-medium">{t("uploadPhoto")}</p>
                <p className="text-xs">PNG, JPG · max 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
          </label>
          <div className="mt-4 flex gap-2">
            <Button onClick={analyze} disabled={!preview || busy} className="flex-1 bg-gradient-warm shadow-glow">
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing</> : <><Sprout className="mr-2 h-4 w-4" />{t("analyze")}</>}
            </Button>
            {preview && (<Button variant="outline" onClick={() => { setPreview(null); setAnalysis(""); }}>Clear</Button>)}
          </div>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold">AI Diagnosis</h3>
          {analysis ? (
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{analysis}</div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Upload an image to get instant farming advice — disease detection, treatment options and care tips.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Farming;