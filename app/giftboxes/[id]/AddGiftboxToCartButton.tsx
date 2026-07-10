"use client";

import type { Product } from "@/lib/data";

const cartStorageKey = "greenplanet-cart";

type CartLine = {
  id: string;
  title: string;
  note: string;
  cardText: string;
  items: Product[];
  total: number;
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
  function addToCart() {
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
      items,
      total
    });

    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    window.location.href = "/#orders";
  }

  return <button className="btn primary" onClick={addToCart}>Læg i kurv</button>;
}
