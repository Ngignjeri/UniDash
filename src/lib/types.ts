export type Role = "STUDENT" | "RETAILER" | "RIDER";

export const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  PICKED_UP: "Picked up",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-amber-100 text-amber-700",
  READY_FOR_PICKUP: "bg-indigo-100 text-indigo-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-fuchsia-100 text-fuchsia-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export function formatPrice(cents: number): string {
  return `KES ${(cents / 100).toFixed(2)}`;
}
