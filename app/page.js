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
