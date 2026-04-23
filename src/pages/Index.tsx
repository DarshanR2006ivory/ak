import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircle,
  ShoppingBasket,
  Sprout,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import heroImg from "@/assets/hero-rural.jpg";

const slideIntervalMs = 5000;

const Index = () => {
  const { t } = useI18n();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      eyebrow: "Voice-first guidance",
      title: t("heroTitle"),
      description: t("heroDesc"),
      badge: "Built for first-time smartphone users",
      accentClass: "bg-sunrise",
      statValue: "24/7",
      statLabel: "AI guidance in familiar language",
      featureTitle: t("aiChat"),
      featureDesc: "Ask by text or voice and get practical, local answers fast.",
      chips: ["Schemes", "Farming", "Health support"],
    },
    {
      eyebrow: "Village-ready decisions",
      title: "Daily updates that move with the market",
      description: "Track mandi prices, weather shifts, pest warnings and jobs from one calm, easy dashboard.",
      badge: "Useful before market day and during harvest",
      accentClass: "bg-river",
      statValue: "7 Tools",
      statLabel: "One place for daily rural essentials",
      featureTitle: t("mandi"),
      featureDesc: "Community-shared rates and alerts that help families plan better.",
      chips: ["Mandi", "Weather", "Job matches"],
    },
    {
      eyebrow: "Family-centered access",
      title: "Government schemes explained without the paperwork headache",
      description: "Surface benefits, eligibility and next steps in simple language so families can act with confidence.",
      badge: "Made to reduce confusion and missed opportunities",
      accentClass: "bg-nightfall",
      statValue: "100% Free",
      statLabel: "No hidden fees, just access and clarity",
      featureTitle: t("schemes"),
      featureDesc: "Turn complex forms and policy terms into plain next actions.",
      chips: ["Eligibility", "Documents", "Step-by-step help"],
    },
  ];

  const features = [
    { icon: MessageCircle, title: t("aiChat"), desc: "24/7 guidance with a simple, conversation-first experience.", delay: "0ms" },
    { icon: FileText, title: t("schemes"), desc: "Clear summaries of benefits, documents and next steps.", delay: "90ms" },
    { icon: Sprout, title: t("farming"), desc: "Crop help, seasonal advice and practical diagnosis support.", delay: "180ms" },
    { icon: ShoppingBasket, title: t("mandi"), desc: "Price awareness with a faster path from field to market.", delay: "270ms" },
    { icon: Briefcase, title: t("jobs"), desc: "Opportunity cards matched to skill level and locality.", delay: "360ms" },
    { icon: AlertTriangle, title: t("alerts"), desc: "Weather and safety alerts designed to be noticed quickly.", delay: "450ms" },
    { icon: Users, title: "Community", desc: "A warmer local network for advice, updates and trust.", delay: "540ms" },
  ];

  const stats = [
    { value: "5 Languages", label: "English, Hindi, Tamil, Telugu and Bengali" },
    { value: "8+ Schemes", label: "Government support surfaced in simpler language" },
    { value: "1 Calm App", label: "A cleaner daily workflow for rural families" },
  ];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, slideIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const currentSlide = slides[activeSlide];

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  const goToPrevSlide = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-primary animate-slide-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-warm text-primary-foreground shadow-soft">
              AI
            </span>
            <span className="font-accent tracking-tight">{t("appName")}</span>
          </Link>
          <div className="flex items-center gap-3 animate-slide-right">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-accent">
                {t("signIn")}
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="bg-gradient-warm font-accent shadow-glow hover:opacity-90">
                {t("getStarted")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Indian rural landscape"
            className="h-full w-full animate-hero-pan object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,hsl(130_45%_16%_/_0.78),hsl(28_72%_28%_/_0.42),transparent)]" />
          {slides.map((slide, index) => (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "opacity-0"} ${slide.accentClass}`}
            />
          ))}
        </div>

        <div className="grain-overlay container relative grid min-h-[720px] items-center gap-14 py-16 text-primary-foreground lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur animate-slide-up">
              {currentSlide.eyebrow}
            </span>

            <div key={activeSlide} className="animate-slide-up">
              <h1 className="mt-6 max-w-2xl font-display text-5xl font-extrabold leading-[0.95] text-balance md:text-7xl">
                {currentSlide.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/88 md:text-xl">
                {currentSlide.description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: "120ms" }}>
              {currentSlide.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/92 backdrop-blur"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: "180ms" }}>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-white px-8 text-primary shadow-elevated hover:bg-white/90">
                  <span className="font-accent font-bold">{t("getStarted")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/35 bg-white/10 px-8 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <span className="font-accent font-semibold">{t("signIn")}</span>
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-3 animate-slide-up" style={{ animationDelay: "240ms" }}>
              <button
                type="button"
                onClick={goToPrevSlide}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition hover:bg-white/18"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNextSlide}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition hover:bg-white/18"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="ml-2 flex items-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.featureTitle}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeSlide ? "w-10 bg-white" : "w-2.5 bg-white/40 hover:bg-white/65"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative animate-slide-left lg:justify-self-end">
            <div className="absolute -left-10 top-12 hidden h-32 w-32 rounded-full bg-harvest/30 blur-3xl lg:block" />
            <div className="absolute -right-6 bottom-10 hidden h-36 w-36 rounded-full bg-white/15 blur-3xl lg:block" />

            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/12 p-6 shadow-elevated backdrop-blur-xl">
              <div className="absolute inset-0 bg-[linear-gradient(140deg,hsl(0_0%_100%_/_0.18),transparent_45%,hsl(0_0%_100%_/_0.08))]" />
              <div className="relative flex items-start justify-between gap-6">
                <div>
                  <p className="font-accent text-sm uppercase tracking-[0.28em] text-white/70">Featured Slide</p>
                  <h2 className="mt-3 max-w-sm font-display text-3xl font-bold leading-tight">
                    {currentSlide.featureTitle}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/82">{currentSlide.featureDesc}</p>
                </div>
                <div className={`rounded-3xl px-4 py-3 text-right shadow-soft ${currentSlide.accentClass}`}>
                  <div className="font-accent text-xs uppercase tracking-[0.2em] text-white/75">Impact</div>
                  <div className="mt-1 font-display text-3xl font-bold text-white">{currentSlide.statValue}</div>
                  <div className="mt-1 max-w-[8rem] text-xs leading-5 text-white/84">{currentSlide.statLabel}</div>
                </div>
              </div>

              <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/15 bg-black/10 p-5">
                  <div className="font-accent text-xs uppercase tracking-[0.24em] text-white/62">Why it feels better</div>
                  <p className="mt-3 text-sm leading-7 text-white/86">
                    Large typography, stronger contrast and motion cues make the homepage easier to scan on mobile.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 animate-float">
                  <div className="font-accent text-xs uppercase tracking-[0.24em] text-white/62">Now showing</div>
                  <p className="mt-3 text-lg font-semibold text-white">{currentSlide.badge}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/12">
                    <div
                      key={activeSlide}
                      className="h-full rounded-full bg-white/90 animate-shimmer"
                      style={{ width: "72%", backgroundSize: "200% 200%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative mt-6 rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
                <div className="flex flex-wrap gap-3">
                  {features.slice(0, 4).map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/86"
                    >
                      {feature.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-border/70 bg-gradient-card">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="container grid grid-cols-1 gap-0 divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((stat, index) => (
            <div key={stat.value} className="px-6 py-10 text-center animate-slide-up" style={{ animationDelay: `${index * 90}ms` }}>
              <div className="font-display text-4xl font-extrabold text-primary">{stat.value}</div>
              <div className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-24">
        <div className="mx-auto mb-14 max-w-3xl text-center animate-slide-up">
          <p className="font-accent text-sm uppercase tracking-[0.28em] text-primary">Beautiful, practical, mobile-first</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold text-foreground md:text-6xl">
            A warmer, more animated front door for the product
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            The landing experience now moves in chapters, using expressive serif headlines, cleaner body typography and richer motion to guide attention.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-[1.75rem] border border-border/70 bg-white/70 p-6 shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated animate-slide-up"
              style={{ animationDelay: feature.delay }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-warm group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-accent text-lg font-bold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-hero p-10 text-center text-primary-foreground shadow-elevated">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(0_0%_100%_/_0.2),transparent_35%)]" />
          <div className="relative animate-slide-up">
            <p className="font-accent text-sm uppercase tracking-[0.3em] text-white/70">Ready to launch</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold md:text-5xl">Give the website a stronger first impression</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/82">
              The homepage now has a cinematic hero, upgraded typography and smoother motion without changing the product's core message.
            </p>
            <Link to="/auth?mode=signup" className="mt-8 inline-block">
              <Button size="lg" className="bg-white px-8 text-primary shadow-elevated hover:bg-white/90">
                <span className="font-accent font-bold">Create Free Account</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/70 py-8 text-center text-sm text-muted-foreground">
        AI-powered support for rural India, now with a more expressive visual identity.
      </footer>
    </div>
  );
};

export default Index;
