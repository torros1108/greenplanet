import { giftboxes, initialProducts, type Giftbox, type Product, type ProductVariant } from "@/lib/data";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type ProductRow = {
  legacy_id: string | null; slug: string; title: string; brand: string; category: string; description: string;
  price: number | string; stock: number; sku: string | null; variants?: ProductVariant[] | null; image_url: string | null;
  images?: string[] | null; giftbox_eligible: boolean; occasions: string[] | null; shape: Product["shape"];
  specs?: { label: string; value: string }[] | null;
};
type GiftboxRow = {
  legacy_id: string | null; slug: string; title: string; category: string; description: string; note: string | null;
  recipient: string | null; occasion: string | null; packing: string | null; card_text: string | null;
  delivery: string | null; why: string | null; details: string[] | null; box_price: number | string;
};
type LinkRow = { sort_order: number; giftboxes: { legacy_id: string | null } | null; products: { legacy_id: string | null } | null };

function mapProduct(row: ProductRow): Product {
  return { id: row.legacy_id || row.slug, title: row.title, brand: row.brand, category: row.category, tags: [], description: row.description,
    specs: row.specs || undefined, images: row.images || undefined, cost: 0, price: Number(row.price), stock: row.stock,
    sku: row.sku || row.slug, image: row.image_url || undefined, variants: row.variants || undefined, giftbox: row.giftbox_eligible,
    occasions: row.occasions || [], shape: row.shape || "box", status: "Live" };
}

function fallbackGiftbox(id: string) {
  const giftbox = giftboxes.find((item) => item.id === id);
  if (!giftbox) return null;
  return { giftbox, items: giftbox.productIds.map((productId) => initialProducts.find((product) => product.id === productId)).filter(Boolean) as Product[], boxPrice: 49 };
}

export async function getGiftboxDetail(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return fallbackGiftbox(id);
  const [rows, products, links] = await Promise.all([
    supabaseAdminRequest<GiftboxRow[]>(`giftboxes?legacy_id=eq.${encodeURIComponent(id)}&status=eq.live&select=legacy_id,slug,title,category,description,note,recipient,occasion,packing,card_text,delivery,why,details,box_price&limit=1`),
    supabaseAdminRequest<ProductRow[]>("products?status=eq.live&select=legacy_id,slug,title,brand,category,description,price,stock,sku,variants,image_url,images,giftbox_eligible,occasions,shape,specs"),
    supabaseAdminRequest<LinkRow[]>("giftbox_products?select=sort_order,giftboxes(legacy_id),products(legacy_id)&order=sort_order.asc")
  ]);
  const row = rows[0];
  if (!row) return null;
  const idToProduct = new Map(products.map((product) => [product.legacy_id || product.slug, mapProduct(product)]));
  const productIds = links.filter((link) => link.giftboxes?.legacy_id === id).map((link) => link.products?.legacy_id).filter(Boolean) as string[];
  const giftbox: Giftbox = { id: row.legacy_id || row.slug, title: row.title, category: row.category, description: row.description,
    productIds, note: row.note || "", recipient: row.recipient || "", occasion: row.occasion || "", packing: row.packing || "",
    cardText: row.card_text || "", delivery: row.delivery || "", why: row.why || "", details: row.details || [] };
  return { giftbox, items: productIds.map((productId) => idToProduct.get(productId)).filter(Boolean) as Product[], boxPrice: Number(row.box_price) || 49 };
}

export async function loadPublicRouteIds() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { productIds: initialProducts.filter((p) => p.status === "Live").map((p) => p.id), giftboxIds: giftboxes.map((g) => g.id) };
  }
  const [products, boxes] = await Promise.all([
    supabaseAdminRequest<Array<{ legacy_id: string | null; slug: string }>>("products?status=eq.live&select=legacy_id,slug"),
    supabaseAdminRequest<Array<{ legacy_id: string | null; slug: string }>>("giftboxes?status=eq.live&select=legacy_id,slug")
  ]);
  return { productIds: products.map((p) => p.legacy_id || p.slug), giftboxIds: boxes.map((g) => g.legacy_id || g.slug) };
}