"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/data";

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
  total
}: {
  id: string;
  title: string;
  note: string;
  items: Product[];
  total: number;
}) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const productsWithVariants = useMemo(
    () => items.filter((item) => item.variants?.some((variant) => variant.status !== "archived")),
    [items]
  );
  const missingVariant = productsWithVariants.some((item) => !selectedVariants[item.id]);
  const resolvedItems: CartItem[] = items.map((item) => {
    const variants = item.variants?.filter((variant) => variant.status !== "archived") || [];
    const variant = variants.find((candidate) => candidate.id === selectedVariants[item.id]);
    return variant
      ? { ...item, price: variant.price, stock: variant.stock, sku: variant.sku, image: variant.image || item.image, selectedVariant: variant }
      : item;
  });
  const adjustedTotal = total + resolvedItems.reduce((sum, item, index) => sum + item.price - items[index].price, 0);

  function addToCart() {
    if (missingVariant) return;
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
    window.location.href = "/#orders";
  }

  return (
    <div className="giftbox-purchase-controls">
      {productsWithVariants.map((item) => {
        const variants = item.variants?.filter((variant) => variant.status !== "archived") || [];
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
      <button className="btn primary" disabled={missingVariant} onClick={addToCart}>
        {missingVariant ? "Vælg farve først" : `Læg i kurv · ${Math.round(adjustedTotal)} kr.`}
      </button>
    </div>
  );
}