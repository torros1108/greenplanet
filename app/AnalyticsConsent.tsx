"use client";

import { useEffect, useState } from "react";

const consentStorageKey = "greenplanet-cookie-consent";
const googleAnalyticsId = "G-53L8K46EHN";

function loadAnalytics() {
  if (document.querySelector(`script[data-greenplanet-analytics="${googleAnalyticsId}"]`)) return;

  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
  gtagScript.dataset.greenplanetAnalytics = googleAnalyticsId;
  document.head.appendChild(gtagScript);

  const dataLayer = window.dataLayer || [];
  window.dataLayer = dataLayer;
  window.gtag = (...args: unknown[]) => {
    dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", googleAnalyticsId);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(consentStorageKey) === "accepted";
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("greenplanet-open-cookie-settings"));
}

export default function AnalyticsConsent() {
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(consentStorageKey);
    setChoice(stored);
    if (stored === "accepted") loadAnalytics();

    function openSettings() {
      setChoice(null);
    }

    window.addEventListener("greenplanet-open-cookie-settings", openSettings);
    return () => window.removeEventListener("greenplanet-open-cookie-settings", openSettings);
  }, []);

  function choose(nextChoice: "accepted" | "declined") {
    window.localStorage.setItem(consentStorageKey, nextChoice);
    setChoice(nextChoice);
    window.dispatchEvent(new Event("greenplanet-consent-change"));
    if (nextChoice === "accepted") loadAnalytics();
  }

  if (choice) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Cookievalg">
      <div>
        <strong>Cookies og statistik</strong>
        <p>Vi bruger nødvendige funktioner til kurv og checkout. Med dit samtykke bruger vi statistik til at forstå, hvilke sider og kurve der fungerer bedst.</p>
      </div>
      <div className="cookie-consent-actions">
        <button className="btn" onClick={() => choose("declined")}>Kun nødvendige</button>
        <button className="btn primary" onClick={() => choose("accepted")}>Accepter statistik</button>
      </div>
    </div>
  );
}
