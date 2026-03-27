import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClockIcon } from "lucide-react";
import { motion } from "motion/react";
import { Decision } from "../backend";
import { usePredictionHistory } from "../hooks/useQueries";

function decisionBadge(decision: Decision) {
  if (decision === Decision.approved)
    return (
      <span className="status-approved inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold">
        Approved
      </span>
    );
  if (decision === Decision.denied)
    return (
      <span className="status-denied inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold">
        Denied
      </span>
    );
  return (
    <span className="status-review inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold">
      Under Review
    </span>
  );
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryTab() {
  const { data, isLoading, isError } = usePredictionHistory();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" data-ocid="history.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="bg-card rounded-xl border border-border shadow-card p-8 text-center"
        data-ocid="history.error_state"
      >
        <p className="text-destructive font-semibold">
          Failed to load history.
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Please try again later.
        </p>
      </div>
    );
  }

  const sorted = [...(data ?? [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  if (sorted.length === 0) {
    return (
      <div
        className="bg-card rounded-xl border border-border shadow-card flex flex-col items-center justify-center min-h-72 gap-4 text-center p-8"
        data-ocid="history.empty_state"
      >
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <ClockIcon className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">No Applications Yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Submit your first application to see your prediction history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
      data-ocid="history.table"
    >
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">
          Application History
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {sorted.length} application{sorted.length !== 1 ? "s" : ""} submitted
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs font-semibold text-muted-foreground">
              #
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">
              Applicant
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">
              Loan Amount
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">
              Credit Score
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">
              Likelihood
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">
              Decision
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">
              Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((record, idx) => (
            <TableRow
              key={`${record.application.name}-${String(record.timestamp)}`}
              className="hover:bg-muted/20 transition-colors"
              data-ocid={`history.item.${idx + 1}`}
            >
              <TableCell className="text-xs text-muted-foreground font-medium">
                {sorted.length - idx}
              </TableCell>
              <TableCell className="font-medium text-sm text-foreground">
                {record.application.name}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                ${Number(record.application.loanAmount).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {Number(record.application.creditScore)}
              </TableCell>
              <TableCell className="text-sm font-semibold text-foreground">
                {Math.round(record.result.approvalLikelihood)}%
              </TableCell>
              <TableCell>{decisionBadge(record.result.decision)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(record.timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
