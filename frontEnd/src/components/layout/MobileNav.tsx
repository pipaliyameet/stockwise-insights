import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LineChart, BrainCircuit, GitCompareArrows, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./AppSidebar";
import { cn } from "@/lib/utils";

const PRIMARY_MOBILE_TABS = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/stock-analysis", label: "Analysis", icon: LineChart },
  { to: "/prediction", label: "Predict", icon: BrainCircuit },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
] as const;

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <>
      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 inset-x-0 z-50 w-full max-w-full overflow-hidden border-t border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 lg:hidden shadow-lg pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="flex h-14 w-full max-w-full items-center justify-around px-0.5">
          {PRIMARY_MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.to === "/" ? currentPath === "/" : currentPath.startsWith(tab.to);

            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "relative flex flex-1 min-w-0 flex-col items-center justify-center py-1 text-center transition-colors touch-manipulation select-none",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && <span className="absolute top-0 h-0.5 w-6 rounded-full bg-primary" />}
                <Icon
                  className={cn("size-5 shrink-0 transition-transform", isActive && "scale-105")}
                />
                <span className="text-[10px] leading-tight truncate w-full px-0.5 mt-0.5">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More menu button */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 min-w-0 flex-col items-center justify-center py-1 text-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation select-none cursor-pointer"
          >
            <Menu className="size-5 shrink-0" />
            <span className="text-[10px] leading-tight truncate w-full px-0.5 mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Drawer sheet for full navigation on mobile */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Mobile Navigation Drawer</SheetTitle>
          <SidebarContent onNavigate={() => setMoreOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
