type Variant = { id: string; stock: number; status?: string };
type StockProduct = { stock: number; variants?: Variant[] | null };

export function publicVariants<T extends Variant>(variants?: T[] | null): T[] {
  return (variants || []).filter((variant) => !variant.status || variant.status === "live");
}

export function isProductAvailable(product: StockProduct): boolean {
  return product.variants?.length
    ? publicVariants(product.variants).some((variant) => variant.stock > 0)
    : product.stock > 0;
}

export function canAddProduct(product: StockProduct, variantId?: string): boolean {
  return product.variants?.length
    ? publicVariants(product.variants).some((variant) => variant.id === variantId && variant.stock > 0)
    : !variantId && product.stock > 0;
}
