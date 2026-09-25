import { useState, type ReactNode } from "react";
import { Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { downloadFile, toCsv } from "@/utils/format";
import { toast } from "sonner";

type ChartCardProps = {
  title: string;
  description?: string | undefined;
  children: ReactNode;
  actions?: ReactNode | undefined;
  exportData?: Record<string, unknown>[] | undefined;
  exportName?: string | undefined;
  className?: string | undefined;
  allowFullscreen?: boolean;
};

/** Standard chart container: title, description, export + fullscreen affordances. */
export function ChartCard({
  title,
  description,
  children,
  actions,
  exportData,
  exportName = "chart-data",
  className,
  allowFullscreen = true,
}: ChartCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleExport = () => {
    if (!exportData?.length) {
      toast.error("Nothing to export", { description: "This chart has no data loaded yet." });
      return;
    }
    downloadFile(toCsv(exportData), `${exportName}.csv`);
    toast.success("Export started", { description: `${exportName}.csv` });
  };

  return (
    <section className={cn("panel flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {actions}
          {exportData ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Export ${title} data`}
              onClick={handleExport}
            >
              <Download className="size-4" />
            </Button>
          ) : null}
          {allowFullscreen ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Expand ${title}`}
              onClick={() => setExpanded(true)}
            >
              <Maximize2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="flex-1 p-4 sm:p-5">{children}</div>

      {allowFullscreen ? (
        <Dialog open={expanded} onOpenChange={setExpanded}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="h-[65vh]">{children}</div>
          </DialogContent>
        </Dialog>
      ) : null}
    </section>
  );
}
