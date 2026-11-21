import type { ReactNode } from "react";
import Link from "next/link";
import type { Giftbox, Product } from "@/lib/data";
import { money } from "@/lib/money";

type Props = {
  giftbox: Giftbox;
  items: Product[];
  total: number;
  available: boolean;
  detailLabel?: string;
  purchaseAction?: ReactNode;
};

export function GiftboxCard({ giftbox, items, total, available, detailLabel = "Se gaveæsken", purchaseAction }: Props) {
  const href = `/giftboxes/${giftbox.id}`;
  const photos = items.flatMap((item) => {
    const src = item.image || item.images?.[0];
    return src ? [{ id: item.id, src }] : [];
  }).slice(0, 4);

  return (
    <article className="giftbox-card">
      <Link className="giftbox-card-media" data-photos={photos.length} href={href} aria-label={`Se indholdet i ${giftbox.title}`}>
        {photos.map((photo) => <img src={photo.src} alt="" loading="lazy" key={photo.id} />)}
        {!photos.length && <span>Ingen produktfotos</span>}
      </Link>
      <div className="giftbox-card-copy">
        <p className="giftbox-card-category">{giftbox.category}</p>
        <h3>{giftbox.title}</h3>
        <p className="giftbox-card-description">{giftbox.description}</p>
        {items.length > 0 && (
          <div className="giftbox-card-contents">
            <p>I gaveæsken</p>
            <ul aria-label="Indhold i gaveæsken">
              {items.map((item) => <li key={item.id}>{item.title}</li>)}
            </ul>
          </div>
        )}
        <div className="giftbox-card-footer">
          <div className="giftbox-card-price">
            <strong>{money(total)}</strong>
            <span>{available ? "Inkl. gaveæske og kort" : "Ikke på lager"}</span>
          </div>
          <div className="giftbox-card-actions">
            {purchaseAction || <Link className="btn primary" href={href}>{detailLabel}</Link>}
            {purchaseAction && <Link className="giftbox-card-detail-link" href={href}>{detailLabel}</Link>}
          </div>
        </div>
      </div>
    </article>
  );
}
