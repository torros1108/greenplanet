"use client";

import type { FormEvent } from "react";
import { useState } from "react";

const products = [
  "Anna keramikvase, hvid",
  "Terra bakke, caffe",
  "Valencia Duo vase og lysestage",
  "En kombination af produkterne",
  "Jeg vil gerne rådgives"
];

export default function CorporateGiftInquiry() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/corporate-gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Forespørgslen kunne ikke sendes.");
      form.reset();
      setStatus(data.message || "Tak. Vi vender tilbage med et forslag.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Forespørgslen kunne ikke sendes.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="corporate-inquiry-form" onSubmit={submitInquiry}>
      <div className="corporate-form-grid">
        <label><span>Virksomhed</span><input name="company" required maxLength={120} autoComplete="organization" /></label>
        <label><span>Kontaktperson</span><input name="name" required maxLength={120} autoComplete="name" /></label>
        <label><span>E-mail</span><input name="email" required type="email" maxLength={180} autoComplete="email" /></label>
        <label><span>Telefon</span><input name="phone" maxLength={40} autoComplete="tel" /></label>
        <label><span>Antal gaver</span><input name="quantity" required type="number" min="1" max="5000" defaultValue="25" /></label>
        <label>
          <span>Interesse</span>
          <select name="product" defaultValue={products[3]}>
            {products.map((product) => <option key={product}>{product}</option>)}
          </select>
        </label>
      </div>
      <label><span>Ønsker og budget</span><textarea name="message" rows={5} maxLength={2000} placeholder="Fortæl fx om budget pr. gave, ønsket leveringsdato og om gaverne skal sendes samlet eller enkeltvis." /></label>
      <label className="corporate-honeypot" aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
      <div className="corporate-form-actions">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "Sender..." : "Få et uforpligtende tilbud"}</button>
        <p aria-live="polite">{status}</p>
      </div>
    </form>
  );
}
