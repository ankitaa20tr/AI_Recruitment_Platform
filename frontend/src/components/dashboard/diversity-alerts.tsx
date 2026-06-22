import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface DiversityAlert {
  type: string;
  severity: string;
  title: string;
  message: string;
}

interface BreakdownItem {
  name: string;
  count: number;
}

interface DiversityInsights {
  education_breakdown?: BreakdownItem[];
  employer_breakdown?: BreakdownItem[];
  hidden_gem_count?: number;
}

function severityVariant(severity: string): "warning" | "secondary" | "gem" {
  if (severity === "high") return "gem";
  if (severity === "medium") return "warning";
  return "secondary";
}

export function DiversityAlertsPanel({
  alerts,
  insights,
}: {
  alerts: DiversityAlert[];
  insights?: DiversityInsights;
}) {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-muted">
        No diversity alerts detected. A homogeneous shortlist will trigger educational or employer concentration warnings.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const tone =
          alert.severity === "high"
            ? { box: "border-danger/40 bg-danger-soft", icon: "text-danger", text: "text-danger" }
            : alert.severity === "medium"
              ? { box: "border-warn/40 bg-warn-soft", icon: "text-warn", text: "text-warn" }
              : { box: "border-line bg-elevated", icon: "text-info", text: "text-muted" };
        return (
          <div
            key={alert.type}
            className={`rounded-lg border p-4 ${tone.box}`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${tone.icon}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-fg">{alert.title}</p>
                  <Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge>
                </div>
                <p className={`mt-1 text-sm ${tone.text}`}>{alert.message}</p>
              </div>
            </div>
          </div>
        );
      })}

      {insights?.hidden_gem_count != null && insights.hidden_gem_count > 0 && (
        <div className="rounded-lg border border-gem/40 bg-gem-soft p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gem" />
            <p className="text-sm text-gem">
              <strong>{insights.hidden_gem_count} hidden gem(s)</strong> scored above 80% with non-traditional
              educational or employer backgrounds. Review them alongside the top-ranked shortlist.
            </p>
          </div>
        </div>
      )}

      {(insights?.education_breakdown?.length ?? 0) > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted">Top Universities in Pool</h4>
          <div className="flex flex-wrap gap-2">
            {insights!.education_breakdown!.slice(0, 6).map((item) => (
              <Badge key={item.name} variant="secondary">
                {item.name} ({item.count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {(insights?.employer_breakdown?.length ?? 0) > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted">Top Previous Employers</h4>
          <div className="flex flex-wrap gap-2">
            {insights!.employer_breakdown!.slice(0, 6).map((item) => (
              <Badge key={item.name} variant="secondary">
                {item.name} ({item.count})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
