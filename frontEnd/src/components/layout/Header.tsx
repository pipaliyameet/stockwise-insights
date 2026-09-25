import { useEffect, useState } from "react";
import { Menu, RefreshCw, Search, Clock, TrendingUp, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarContent } from "./AppSidebar";
import { useAppState } from "@/hooks/useAppState";
import { STOCKS, findStock } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function MarketStatus() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      // Indian Standard Time (UTC + 5:30)
      const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
      const mins = ist.getHours() * 60 + ist.getMinutes();
      const weekday = ist.getDay() >= 1 && ist.getDay() <= 5;
      // Regular NSE/BSE trading hours: 09:15 to 15:30 IST (555 to 930 mins)
      setOpen(weekday && mins >= 555 && mins <= 930);
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium md:inline-flex"
      title="Indian Market Regular Hours: Mon–Fri 09:15–15:30 IST (excl. holidays)"
    >
      <span
        className={cn(
          "size-2 rounded-full",
          open ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/60",
        )}
        aria-hidden
      />
      <span className="text-[11px] font-semibold text-foreground">
        Market {open ? "Open" : "Closed"}
      </span>
      <span className="text-[10px] text-muted-foreground">(09:15–15:30 IST)</span>
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date()) + " IST",
      );
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="hidden items-center gap-1 text-xs font-mono text-muted-foreground xl:inline-flex">
      <Clock className="size-3.5 text-muted-foreground/70" aria-hidden />
      {now ?? "—"}
    </span>
  );
}

export function Header() {
  const { symbol, setSymbol, refresh } = useAppState();
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const meta = findStock(symbol);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = query.trim().toUpperCase();
    if (!value) return;
    setSymbol(value);
    setQuery("");
    toast.success(`Active stock set to ${value}`);
  };

  const handleSelectQuick = (s: string) => {
    setSymbol(s);
    toast.success(`Active stock set to ${s}`);
  };

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Market data & models refreshed");
    }, 600);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      {/* Desktop & Tablet Main Header Row */}
      <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6">
        {/* Mobile Menu Trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 size-9"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">StockWise Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Mobile Brand Title */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TrendingUp className="size-4" />
          </span>
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-tight text-foreground">StockWise</span>
            <span className="hidden sm:inline text-[11px] text-muted-foreground ml-1.5 font-normal">
              ML Analytics
            </span>
          </div>
        </div>

        {/* Desktop Search Box */}
        <form
          onSubmit={submit}
          className="hidden sm:flex relative min-w-0 flex-1 max-w-sm lg:max-w-md"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stock symbol... (e.g. TCS, INFY, RELIANCE)"
            aria-label="Search stock symbol"
            className="pl-9 pr-8 h-9 text-xs font-mono uppercase bg-background/70 focus:bg-background"
            list="header-stock-list"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
          <datalist id="header-stock-list">
            {STOCKS.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.name} ({s.ticker})
              </option>
            ))}
          </datalist>
        </form>

        {/* Right Info Elements */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Active Stock Badge */}
          <div className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
            <span>{symbol}</span>
            {meta?.ticker && meta.ticker !== symbol && (
              <span className="hidden sm:inline text-[10px] text-primary/70 font-normal">
                ({meta.ticker})
              </span>
            )}
          </div>

          <MarketStatus />
          <LiveClock />

          <Button
            variant="outline"
            size="icon"
            className="size-8 sm:size-9"
            aria-label="Refresh market data and models"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("size-3.5 sm:size-4", isRefreshing && "animate-spin text-primary")}
            />
          </Button>
        </div>
      </div>

      {/* Mobile Search Row */}
      <div className="px-3 pb-2.5 sm:hidden">
        <form onSubmit={submit} className="relative w-full">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stock symbol (TCS, INFY, RELIANCE)..."
            aria-label="Search stock symbol"
            className="pl-8 pr-7 h-8 text-xs font-mono uppercase bg-background/80"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </form>
      </div>

      {/* Mobile Horizontal Quick Stock Ticker */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-1.5 border-t border-border/50 lg:hidden scrollbar-none bg-muted/20">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider shrink-0 mr-1">
          Stocks:
        </span>
        {STOCKS.slice(0, 7).map((s) => {
          const isActive = s.symbol === symbol.toUpperCase();
          return (
            <button
              key={s.symbol}
              type="button"
              onClick={() => handleSelectQuick(s.symbol)}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-mono font-semibold transition-all shrink-0 cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s.symbol}
            </button>
          );
        })}
      </div>
    </header>
  );
}
