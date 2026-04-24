import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  ShoppingBasket,
  Sprout,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { toast } from "sonner";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const links = [
    { to: "/app", label: t("dashboard"), icon: LayoutDashboard, end: true },
    { to: "/app/chat", label: t("aiChat"), icon: MessageCircle },
    { to: "/app/schemes", label: t("schemes"), icon: FileText },
    { to: "/app/farming", label: t("farming"), icon: Sprout },
    { to: "/app/mandi", label: t("mandi"), icon: ShoppingBasket },
    { to: "/app/jobs", label: t("jobs"), icon: Briefcase },
    { to: "/app/alerts", label: t("alerts"), icon: AlertTriangle },
    { to: "/app/community", label: "Community", icon: Users },
  ];

  if (loading) {
    return <div className="page-shell flex min-h-screen items-center justify-center font-accent text-muted-foreground">...</div>;
  }

  return (
    <div className="page-shell flex min-h-screen bg-transparent">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border/70 bg-sidebar/88 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/70 px-5">
          <Link to="/app" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-warm font-accent text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground">
              AI
            </span>
            {t("appName")}
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-smooth ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "font-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-border/70 p-3">
          <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-3 font-accent">
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/55 px-4 backdrop-blur-xl lg:px-8">
          <button onClick={() => setOpen(true)} className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm text-muted-foreground lg:block">
            {t("welcome")}, <span className="font-accent font-semibold text-foreground">{user?.email}</span>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="flex-1 p-4 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
