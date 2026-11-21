"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { ProductVariant } from "@/lib/data";

type Selection = {
  variantId: string;
  setVariantId: (id: string) => void;
  image: string | null;
  setImage: (image: string | null) => void;
};

const ProductSelectionContext = createContext<Selection | null>(null);

export function ProductSelection({ children }: { children: React.ReactNode }) {
  const [variantId, setVariantId] = useState("");
  const [image, setImage] = useState<string | null>(null);
  return <ProductSelectionContext.Provider value={{ variantId, setVariantId, image, setImage }}>{children}</ProductSelectionContext.Provider>;
}

export function useProductSelection() {
  const selection = useContext(ProductSelectionContext);
  if (!selection) throw new Error("ProductSelection is required");
  return selection;
}

export function ProductGallery({ title, images, variants }: { title: string; images: string[]; variants: ProductVariant[] }) {
  const { image, setImage, variantId } = useProductSelection();
  const selectedVariant = variants.find((variant) => variant.id === variantId);
  const activeImage = image || selectedVariant?.image || images[0];
  const [zoomed, setZoomed] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closeZoom = () => { setZoomed(false); requestAnimationFrame(() => opener.current?.focus()); };

  if (!images.length) return null;
  return (
    <div className="product-gallery">
      <button className="gallery-main visual-frame product-gallery-open" ref={opener} type="button" onClick={() => setZoomed(true)} aria-label={`Forstør billede af ${title}`}>
        <img className="product-image" src={activeImage} alt={selectedVariant ? `${title} - ${selectedVariant.title}` : title} />
      </button>
      {images.length > 1 && <div className="gallery-thumbs" aria-label="Produktbilleder">
        {images.map((source, index) => <button className={`gallery-thumb ${source === activeImage ? "active" : ""}`} type="button" key={source} onClick={() => setImage(source)} aria-label={`Vis billede ${index + 1} af ${title}`} aria-pressed={source === activeImage}>
          <img src={source} alt="" />
        </button>)}
      </div>}
      {zoomed && <div className="product-gallery-zoom" role="dialog" aria-modal="true" aria-label={`Forstørret billede af ${title}`} onKeyDown={(event) => { if (event.key === "Escape") closeZoom(); }}>
        <button type="button" autoFocus onClick={closeZoom} aria-label="Luk billede">×</button>
        <img src={activeImage} alt={selectedVariant ? `${title} - ${selectedVariant.title}` : title} />
      </div>}
    </div>
  );
}
