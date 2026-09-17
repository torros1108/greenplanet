"use client";

import { useEffect, useState } from "react";

const consentStorageKey = "greenplanet-cookie-consent";
const googleAnalyticsId = "G-53L8K46EHN";

function loadAnalytics() {
  window["ga-disable-G-53L8K46EHN"] = false;
  if (document.querySelector(`script[data-greenplanet-analytics="${googleAnalyticsId}"]`)) return;

  const dataLayer = window.dataLayer || [];
  window.dataLayer = dataLayer;
  // Google consumes Arguments objects as commands, not ordinary arrays.
  window.gtag = function () {
    dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", googleAnalyticsId, { allow_google_signals: false, allow_ad_personalization_signals: false });

  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
  gtagScript.dataset.greenplanetAnalytics = googleAnalyticsId;
  document.head.appendChild(gtagScript);
  gtagScript.onerror = () => gtagScript.remove();
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    "ga-disable-G-53L8K46EHN"?: boolean;
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
    const wasAccepted = hasAnalyticsConsent();
    window.localStorage.setItem(consentStorageKey, nextChoice);
    setChoice(nextChoice);
    window.dispatchEvent(new Event("greenplanet-consent-change"));
    if (nextChoice === "accepted") loadAnalytics();
    if (nextChoice === "declined" && wasAccepted) {
      window["ga-disable-G-53L8K46EHN"] = true;
      window.location.reload();
    }
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
