import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  fullName: z.string().trim().min(1).max(100).optional(),
});

const Auth = () => {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  useEffect(() => {
    if (user) navigate("/app");
  }, [user, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName: mode === "signup" ? fullName : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { full_name: fullName, preferred_language: lang },
          },
        });
        if (error) throw error;
        toast.success("Account created! You can now sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-shell grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(0_0%_100%_/_0.24),transparent_36%)]" />
        <div className="absolute -right-14 top-16 h-56 w-56 rounded-full bg-white/12 blur-3xl" />
        <div className="absolute bottom-8 left-8 h-44 w-44 rounded-full bg-harvest/20 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3 font-display text-xl font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 font-accent text-xs uppercase tracking-[0.18em]">AI</span>
          {t("appName")}
        </Link>

        <div className="relative max-w-lg">
          <p className="font-accent text-sm uppercase tracking-[0.28em] text-white/72">Welcome back</p>
          <h2 className="mt-4 font-display text-5xl font-bold leading-tight">{t("heroTitle")}</h2>
          <p className="mt-4 text-lg leading-8 text-white/88">{t("heroDesc")}</p>
        </div>

        <p className="relative font-accent text-sm text-white/70">{t("appName")} for rural India</p>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-end gap-2 p-4">
          <LanguageSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-md animate-scale-in rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-elevated backdrop-blur-xl">
            <div className="mb-8 text-center">
              <p className="font-accent text-sm uppercase tracking-[0.28em] text-primary">
                {mode === "signin" ? "Sign in" : "Create account"}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold text-foreground">
                {mode === "signin" ? t("signIn") : t("signUp")}
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {mode === "signin" ? "Welcome back to the platform." : "Set up your free account in a few steps."}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-accent">
                    {t("fullName")}
                  </Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-accent">
                  {t("email")}
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pw" className="font-accent">
                  {t("password")}
                </Label>
                <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={72} />
              </div>

              <Button type="submit" disabled={busy} className="w-full bg-gradient-warm font-accent shadow-glow hover:opacity-90">
                {busy ? "..." : mode === "signin" ? t("signIn") : t("signUp")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-accent font-semibold text-primary hover:underline"
              >
                {mode === "signin" ? t("signUp") : t("signIn")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
