import { useEffect, useState } from "react";
import { Ticket, getSLAStatus, formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface SLATimerProps {
  ticket: Ticket;
}

export function SLATimer({ ticket }: SLATimerProps) {
  const [status, setStatus] = useState(getSLAStatus(ticket));

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSLAStatus(ticket));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [ticket]);

  if (ticket.status === "DONE") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400/80">
        <Clock className="w-3.5 h-3.5" />
        <span>Concluído</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border transition-all",
        status.isBreached
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : status.isWarning
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          : "bg-emerald-500/5 text-emerald-400/80 border-emerald-500/10"
      )}
    >
      {status.isBreached ? (
        <AlertTriangle className="w-3.5 h-3.5" />
      ) : (
        <Clock className="w-3.5 h-3.5" />
      )}
      <span>
        {status.isBreached ? "Estourado por " : ""}
        {formatDuration(Math.abs(status.remaining))}
      </span>
    </div>
  );
}
