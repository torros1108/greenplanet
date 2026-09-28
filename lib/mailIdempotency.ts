export type OrderMailType = "order-confirmation" | "customer-welcome" | "admin-order-notification";

export function orderMailIdempotencyKey(orderId: string, mailType: OrderMailType) {
  return `greenplanet/${mailType}/${orderId}`;
}
