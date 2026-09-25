import {
  LayoutDashboard,
  LineChart,
  BrainCircuit,
  Table2,
  BarChart3,
  Gauge,
  GitCompareArrows,
  Info,
  TrendingUp,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const OVERVIEW_NAV = [{ to: "/", label: "Dashboard", icon: LayoutDashboard }] as const;

export const ANALYSIS_NAV = [
  { to: "/stock-analysis", label: "Stock Analysis", icon: LineChart },
  { to: "/prediction", label: "Prediction", icon: BrainCircuit },
  { to: "/historical-data", label: "Historical Data", icon: Table2 },
] as const;

export const INSIGHTS_NAV = [
  { to: "/visualizations", label: "Visualizations", icon: BarChart3 },
  { to: "/model-performance", label: "Model Performance", icon: Gauge },
  { to: "/compare", label: "Compare Stocks", icon: GitCompareArrows },
] as const;

export const PROJECT_NAV = [{ to: "/about", label: "About Project", icon: Info }] as const;

function NavLink({
  to,
  label,
  icon: Icon,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof Info;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      activeOptions={{ exact: to === "/" }}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/80 transition-all",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
      activeProps={{
        className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs",
      }}
    >
      <Icon className="size-4 shrink-0 text-sidebar-foreground/70" aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
          <TrendingUp className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight text-sidebar-foreground">
            StockWise
          </p>
          <p className="truncate text-[11px] font-medium text-muted-foreground">Stock Market ML</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3" aria-label="Main navigation">
        <div>
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Overview
          </p>
          <div className="space-y-0.5">
            {OVERVIEW_NAV.map((item) => (
              <NavLink key={item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Analysis
          </p>
          <div className="space-y-0.5">
            {ANALYSIS_NAV.map((item) => (
              <NavLink key={item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Insights
          </p>
          <div className="space-y-0.5">
            {INSIGHTS_NAV.map((item) => (
              <NavLink key={item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Project
          </p>
          <div className="space-y-0.5">
            {PROJECT_NAV.map((item) => (
              <NavLink key={item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Status / System section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg border border-border bg-card/60 p-2.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            <span className="text-xs font-semibold text-foreground">ML Engine Active</span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground leading-tight">
            Linear Regression + KNN (scikit-learn)
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border lg:block">
      <div className="fixed inset-y-0 left-0 w-60 border-r border-sidebar-border">
        <SidebarContent />
      </div>
    </aside>
  );
}
