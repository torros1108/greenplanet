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
  const [variantId, setVariantId] = useState("");
  const selectedVariant = variants.find((variant) => variant.id === variantId) || null;

  function addToCart() {
    if (variants.length > 0 && !selectedVariant) return;

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
          <span>Vælg farve</span>
          <select value={selectedVariant?.id || ""} onChange={(event) => setVariantId(event.target.value)}>
            <option value="">Vælg farve</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                {variant.title} · {Math.round(variant.price)} kr. · {variant.stock > 0 ? `${variant.stock} på lager` : "Ikke på lager"}
              </option>
            ))}
          </select>
        </label>
      )}
      <button className="btn primary" disabled={variants.length > 0 && !selectedVariant} onClick={addToCart}>
        {variants.length > 0 && !selectedVariant ? "Vælg farve først" : "Læg i kurv"}
      </button>
    </>
  );
}
