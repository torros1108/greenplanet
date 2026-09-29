import Link from "next/link";

const messages: Record<string, { title: string; text: string }> = {
  confirmed: { title: "Din tilmelding er bekræftet", text: "Tak. Du modtager nu nyt fra Greenplanet på den e-mailadresse, du bekræftede." },
  unsubscribed: { title: "Du er afmeldt", text: "E-mailadressen er fjernet fra Greenplanets nyhedsbrev. Du kan altid tilmelde dig igen." },
  invalid: { title: "Linket er ugyldigt", text: "Linket er udløbet eller allerede brugt. Tilmeld dig igen på forsiden for at få et nyt link." },
  error: { title: "Noget gik galt", text: "Vi kunne ikke behandle linket lige nu. Prøv igen senere eller kontakt Greenplanet." }
};

export default async function NewsletterStatusPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const message = messages[status || ""] || messages.invalid;
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "#f5efe3", color: "#17231b" }}>
      <section style={{ width: "min(560px, 100%)", background: "#fffdf7", border: "1px solid #ddd4c5", padding: "40px" }}>
        <p style={{ color: "#8e5d52", fontWeight: 700, textTransform: "uppercase" }}>Greenplanet nyhedsbrev</p>
        <h1 style={{ color: "#103d2a", fontSize: "clamp(2rem, 7vw, 3.5rem)" }}>{message.title}</h1>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.6 }}>{message.text}</p>
        <Link href="/" style={{ display: "inline-block", marginTop: "18px", background: "#103d2a", color: "white", padding: "13px 20px", textDecoration: "none" }}>Til forsiden</Link>
      </section>
    </main>
  );
}