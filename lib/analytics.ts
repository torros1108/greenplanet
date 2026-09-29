export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

export function analyticsItem(input: { id: string; title: string; brand?: string; price: number; variant?: string; quantity?: number }): AnalyticsItem {
  return { item_id: input.id, item_name: input.title, ...(input.brand ? { item_brand: input.brand } : {}),
    ...(input.variant ? { item_variant: input.variant } : {}), price: Math.round(input.price * 100) / 100, quantity: input.quantity || 1 };
}

export function ecommercePayload(value: number, items: AnalyticsItem[], transactionId?: string) {
  return { currency: "DKK", value: Math.round(value * 100) / 100, items, ...(transactionId ? { transaction_id: transactionId } : {}) };
}