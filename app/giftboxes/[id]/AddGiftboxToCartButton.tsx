"use client";

import { useEffect, useMemo, useState } from "react";
import { hasAnalyticsConsent } from "@/app/AnalyticsConsent";
import { analyticsItem, ecommercePayload } from "@/lib/analytics";
import type { Product, ProductVariant } from "@/lib/data";
import { canAddProduct, isProductAvailable, publicVariants } from "@/lib/catalogRules";
import { money } from "@/lib/money";

const cartStorageKey = "greenplanet-cart";

type CartItem = Product & { selectedVariant?: ProductVariant };
type CartLine = {
  id: string;
  title: string;
  note: string;
  cardText: string;
  items: CartItem[];
  total: number;
  source?: {
    type: "giftbox";
    giftboxId: string;
    selectedIds: string[];
    selectedVariants: Record<string, string>;
  };
};

export function AddGiftboxToCartButton({
  id,
  title,
  note,
  items,
  expectedItemCount,
  total,
  boxPrice
}: {
  id: string;
  title: string;
  note: string;
  items: Product[];
  expectedItemCount: number;
  total: number;
  boxPrice: number;
}) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const productsWithVariants = useMemo(
    () => items.filter((item) => publicVariants(item.variants).length > 0),
    [items]
  );
  const missingVariant = productsWithVariants.some((item) => !selectedVariants[item.id]);
  const unavailable = !items.length || items.length !== expectedItemCount || items.some((item) => !isProductAvailable(item));
  const canAdd = !unavailable && items.every((item) => canAddProduct(item, selectedVariants[item.id]));
  const resolvedItems: CartItem[] = items.map((item) => {
    const variants = publicVariants(item.variants);
    const variant = variants.find((candidate) => candidate.id === selectedVariants[item.id]);
    return variant
      ? { ...item, price: variant.price, stock: variant.stock, sku: variant.sku, image: variant.image || item.image, selectedVariant: variant }
      : item;
  });
  const adjustedTotal = total + resolvedItems.reduce((sum, item, index) => sum + item.price - items[index].price, 0);
  // For unselected variants, quote the lowest available price rather than the parent product price.
  let displayTotal = adjustedTotal;
  let isStartingPrice = false;
  for (const item of productsWithVariants) {
    if (selectedVariants[item.id]) continue;
    const prices = publicVariants(item.variants).filter((variant) => variant.stock > 0).map((variant) => variant.price);
    if (!prices.length) continue;
    const lowestPrice = Math.min(...prices);
    displayTotal += lowestPrice - item.price;
    isStartingPrice ||= prices.some((price) => price !== lowestPrice);
  }

  useEffect(() => {
    if (hasAnalyticsConsent() && window.gtag) window.gtag("event", "view_item", ecommercePayload(adjustedTotal, resolvedItems.map((item) => analyticsItem({ id: item.id, title: item.title, brand: item.brand, price: item.price }))));
  }, [adjustedTotal, resolvedItems]);

  function addToCart() {
    if (!canAdd) return;
    const storedCart = window.localStorage.getItem(cartStorageKey);
    let cart: CartLine[] = [];

    try {
      const parsed = storedCart ? JSON.parse(storedCart) : [];
      cart = Array.isArray(parsed) ? parsed : [];
    } catch {
      cart = [];
    }

    cart.push({
      id: `cart-${Date.now()}-${id}`,
      title,
      note,
      cardText: "",
      items: resolvedItems,
      total: adjustedTotal,
      source: {
        type: "giftbox",
        giftboxId: id,
        selectedIds: items.map((item) => item.id),
        selectedVariants
      }
    });

    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    if (hasAnalyticsConsent() && window.gtag) window.gtag("event", "add_to_cart", ecommercePayload(adjustedTotal, resolvedItems.map((item) => analyticsItem({ id: item.id, title: item.title, brand: item.brand, price: item.price, variant: item.selectedVariant?.title }))));
    window.location.href = "/#orders";
  }

  return (
    <div className="giftbox-purchase-controls">
      {productsWithVariants.map((item) => {
        const variants = publicVariants(item.variants);
        return (
          <label className="giftbox-variant-field" key={item.id}>
            <span>Vælg farve til {item.title}</span>
            <select
              value={selectedVariants[item.id] || ""}
              onChange={(event) => setSelectedVariants((current) => ({ ...current, [item.id]: event.target.value }))}
            >
              <option value="">Vælg farve</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                  {variant.title} · {variant.stock > 0 ? `${variant.stock} på lager` : "Udsolgt"}
                </option>
              ))}
            </select>
          </label>
        );
      })}
      {items.length > 0 && items.length === expectedItemCount && (
        <dl className="giftbox-price-breakdown" aria-live="polite" aria-atomic="true">
          <div><dt>Produkter</dt><dd>{isStartingPrice && "Fra "}{money(displayTotal - boxPrice)}</dd></div>
          <div><dt>Gaveæske</dt><dd>{money(boxPrice)}</dd></div>
          <div className="giftbox-price-total"><dt>I alt uden fragt</dt><dd>{isStartingPrice && "Fra "}{money(displayTotal)}</dd></div>
        </dl>
      )}
      <button className="btn primary" type="button" disabled={!canAdd} onClick={addToCart}>
        {unavailable ? "Udsolgt" : missingVariant ? "Vælg farve først" : "Læg i kurv"}
      </button>
    </div>
  );
}
