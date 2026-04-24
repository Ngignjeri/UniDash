import { STATUS_COLOR, STATUS_LABEL, type OrderStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: string }) {
  const s = status as OrderStatus;
  const color = STATUS_COLOR[s] ?? "bg-slate-100 text-slate-700";
  const label = STATUS_LABEL[s] ?? status;
  return <span className={`badge ${color}`}>{label}</span>;
}
