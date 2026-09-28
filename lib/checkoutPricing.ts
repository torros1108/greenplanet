export const giftboxPackagingPrice = 49;
export const deliveryPrice = 49;

export type CheckoutVariant = {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  status?: string;
};

export type CheckoutProduct = {
  legacy_id: string | null;
  title: string;
  brand: string;
  price: number;
  stock: number;
  sku: string | null;
  variants: CheckoutVariant[] | null;
};

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function shippingPrice(deliveryMethod?: string) {
  return deliveryMethod === "Afhentes / aftales" ? 0 : deliveryPrice;
}
