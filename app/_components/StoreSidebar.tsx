"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Current = "gaveaesker" | "babygaver" | "wellness" | "move" | "firmagaver";

const links = [
  { href: "/", label: "Forside" },
  { href: "/gaveaesker", label: "Gaveæsker", current: "gaveaesker" },
  { href: "/babygaver", label: "Baby & barsel", current: "babygaver" },
  { href: "/wellness", label: "Velvære", current: "wellness" },
  { href: "/move", label: "Move", current: "move" },
  { href: "/#builder", label: "Byg selv" },
  { href: "/#orders", label: "Kurv" }
];

export function StoreSidebar({ current }: { current: Current }) {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const refresh = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("greenplanet-cart") || "[]");
        setCartCount(Array.isArray(cart) ? cart.length : 0);
      } catch { setCartCount(0); }
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  useEffect(() => {
    if (!open) return;
    nav.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return <aside className="sidebar store-sidebar">
    <div className="brand"><Link className="logo-lockup" href="/" aria-label="Greenplanet forside"><img className="brand-logo" src="/brand/greenplanet-logo-white-crop.png" alt="Greenplanet" /></Link></div>
    <Link className="mobile-cart-shortcut" href="/#orders" aria-label={`Kurv, ${cartCount} varer`}>Kurv <span>{cartCount}</span></Link>
    <button className={`mobile-nav-toggle ${open ? "open" : ""}`} ref={toggle} type="button" aria-label={open ? "Luk menu" : "Åbn menu"} aria-expanded={open} aria-controls="store-navigation" onClick={() => setOpen(!open)}><span /><span /><span /></button>
    <nav className={`nav ${open ? "open" : ""}`} ref={nav} id="store-navigation" aria-label="Shop">
      {links.map(link => <Link key={link.href} href={link.href} className={link.current === current ? "active" : undefined} onClick={() => setOpen(false)}>{link.label}{link.href === "/#orders" && <span>{cartCount}</span>}</Link>)}
    </nav>
    <p className="side-note">Personlige gaveæsker, velvære og activewear fra udvalgte brands.</p>
  </aside>;
}
