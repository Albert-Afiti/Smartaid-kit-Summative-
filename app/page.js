"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import bodyMarkup from "./bodyMarkup";

export default function Home() {
 const mounted = useRef(false);

 return (
  <>
   {/* The original prototype's full DOM structure (status bar, kit lid,
     supply tray, guidance/triage/alert/log screens, voice + stock
     panels) is preserved exactly so the existing JS , which looks
     elements up by getElementById , keeps working unmodified. */}
   <div dangerouslySetInnerHTML={{ __html: bodyMarkup }} />
   <audio id="audioPlayer" className="hidden"></audio>

   {/* GSAP core, loaded from CDN as a plain global (window.gsap) , not
     imported from the npm package, because smartaid-app.js is a static
     script (public/), not bundled by webpack, so it can't `import` an
     npm module. strategy="beforeInteractive" guarantees window.gsap
     exists before the afterInteractive script below runs. */}
   <Script
    src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"
    strategy="beforeInteractive"
   />

   {/* Boots the original app logic (voice recognition, fuzzy matching,
     triage data, stock tracking, ElevenLabs/browser TTS, alerts,
     activity log) after the markup above is in the DOM. */}
   <Script
    src="/smartaid-app.js"
    strategy="afterInteractive"
    onReady={() => {
     mounted.current = true;
    }}
   />
  </>
 );
}
