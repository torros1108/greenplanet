"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/data";

const cartStorageKey = "greenplanet-cart";

type CartLine = {
  id: string;
  title: string;
  note: string;
  cardText: string;
  items: Array<Product & { selectedVariant?: ProductVariant }>;
  total: number;
};

export function AddToCartButton({ product }: { product: Product }) {
  const variants = useMemo(() => product.variants?.filter((variant) => variant.status !== "archived") || [], [product]);
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const selectedVariant = variants.find((variant) => variant.id === variantId) || variants[0] || null;

  function addToCart() {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    let cart: CartLine[] = [];

    try {
      const parsed = storedCart ? JSON.parse(storedCart) : [];
      cart = Array.isArray(parsed) ? parsed : [];
    } catch {
      cart = [];
    }

    const item = selectedVariant
      ? { ...product, price: selectedVariant.price, stock: selectedVariant.stock, sku: selectedVariant.sku, selectedVariant }
      : product;
    const title = selectedVariant ? `${product.title} · ${selectedVariant.title}` : product.title;

    cart.push({
      id: `cart-${Date.now()}-${product.id}${selectedVariant ? `-${selectedVariant.id}` : ""}`,
      title,
      note: product.brand,
      cardText: "",
      items: [item],
      total: item.price
    });

    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    window.location.href = "/#orders";
  }

  return (
    <>
      {variants.length > 0 && (
        <label className="variant-picker">
          <span>Vælg variant</span>
          <select value={selectedVariant?.id || ""} onChange={(event) => setVariantId(event.target.value)}>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title} · {Math.round(variant.price)} kr. · {variant.stock} på lager
              </option>
            ))}
          </select>
        </label>
      )}
      <button className="btn primary" onClick={addToCart}>Læg i kurv</button>
    </>
  );
}
