"use client";

import { useEffect, useMemo } from "react";
import { hasAnalyticsConsent } from "@/app/AnalyticsConsent";
import { analyticsItem, ecommercePayload } from "@/lib/analytics";
import type { Product, ProductVariant } from "@/lib/data";
import { canAddProduct, isProductAvailable, publicVariants } from "@/lib/catalogRules";
import { money } from "@/lib/money";
import { useProductSelection } from "./ProductSelection";

const cartStorageKey = "greenplanet-cart";

type CartLine = {
  id: string;
  title: string;
  note: string;
  cardText: string;
  items: Array<Product & { selectedVariant?: ProductVariant }>;
  total: number;
  source: { type: "product"; selectedIds: string[]; selectedVariants: Record<string, string> };
};

function variantColor(variant?: ProductVariant | null) {
  if (!variant) return null;
  const title = variant.title.toLowerCase();
  if (title.includes("beige")) return "#d8c4a6";
  if (title.includes("sea blue")) return "#8fb8c9";
  if (title.includes("forest green")) return "#2f5a3d";
  return "#dfeade";
}

export function AddToCartButton({ product }: { product: Product }) {
  const variants = useMemo(() => publicVariants(product.variants), [product]);
  const { variantId, setVariantId, setImage } = useProductSelection();
  const selectedVariant = variants.find((variant) => variant.id === variantId) || null;
  const variantLabel = product.category === "Move" ? "størrelse" : "variant";

  useEffect(() => {
    if (hasAnalyticsConsent() && window.gtag) window.gtag("event", "view_item", ecommercePayload(product.price, [analyticsItem({ id: product.id, title: product.title, brand: product.brand, price: product.price })]));
  }, [product]);

  function addToCart() {
    if (!canAddProduct(product, selectedVariant?.id)) return;

    const storedCart = window.localStorage.getItem(cartStorageKey);
    let cart: CartLine[] = [];

    try {
      const parsed = storedCart ? JSON.parse(storedCart) : [];
      cart = Array.isArray(parsed) ? parsed : [];
    } catch {
      cart = [];
    }

    const item: Product & { selectedVariant?: ProductVariant } = selectedVariant
      ? { ...product, price: selectedVariant.price, stock: selectedVariant.stock, sku: selectedVariant.sku, image: selectedVariant.image || product.image, selectedVariant }
      : product;
    const title = selectedVariant ? `${product.title} · ${selectedVariant.title}` : product.title;

    cart.push({
      id: `cart-${Date.now()}-${product.id}${selectedVariant ? `-${selectedVariant.id}` : ""}`,
      title,
      note: product.brand,
      cardText: "",
      items: [item],
      total: item.price,
      source: {
        type: "product",
        selectedIds: [product.id],
        selectedVariants: selectedVariant ? { [product.id]: selectedVariant.id } : {}
      }
    });

    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    if (hasAnalyticsConsent() && window.gtag) window.gtag("event", "add_to_cart", ecommercePayload(item.price, [analyticsItem({ id: item.id, title: item.title, brand: item.brand, price: item.price, variant: item.selectedVariant?.title })]));
    window.location.href = "/#orders";
  }

  return (
    <>
      {variants.length > 0 && (
        <div className="variant-picker">
          <span>Vælg {variantLabel}</span>
          <div className="variant-options" role="listbox" aria-label={`Vælg ${variantLabel}`}>
            {variants.map((variant) => (
              <button
                className={`variant-option ${selectedVariant?.id === variant.id ? "active" : ""}`}
                key={variant.id}
                onClick={() => { setVariantId(variant.id); setImage(null); }}
                disabled={variant.stock <= 0}
                type="button"
                role="option"
                aria-selected={selectedVariant?.id === variant.id}
                style={{ ["--variant-color" as string]: variantColor(variant) || "#dfeade" }}
              >
                {product.category !== "Move" && <span className="variant-swatch" />}
                <strong>{variant.title}</strong>
                <em>{money(variant.price)} · {variant.stock > 0 ? `${variant.stock} på lager` : "Ikke på lager"}</em>
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedVariant && (
        <div className="variant-preview" style={{ ["--variant-color" as string]: variantColor(selectedVariant) || "#dfeade" }}>
          <span className="variant-swatch" />
          Valgt {variantLabel}: <strong>{selectedVariant.title}</strong>
        </div>
      )}
      <div className="detail-price" aria-live="polite">{money(selectedVariant?.price ?? product.price)}</div>
      <button className="btn primary" disabled={!canAddProduct(product, selectedVariant?.id)} onClick={addToCart}>
        {!isProductAvailable(product) ? "Udsolgt" : variants.length > 0 && !selectedVariant ? `Vælg ${variantLabel} først` : "Læg i kurv"}
      </button>
    </>
  );
}
