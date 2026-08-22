// ═════════════════════════════════════════════════════════════════════
// MARKUP , the app's entire HTML structure, as a single string.
//
// This is the one of three clearly separated pieces of this project:
//   MARKUP (this file)    , what's on screen, structure/IDs only
//   STYLES (globals.css)  , how it looks
//   LOGIC  (public/smartaid-app.js) , all behavior, state, and content
//
// There's no backend/server here , everything runs in the browser.
// This string is mounted via dangerouslySetInnerHTML in app/page.js, and
// public/smartaid-app.js finds its elements by the id="..." attributes
// below, the same way the original single-file prototype did. See
// README.md for the full rationale.
const bodyMarkup = `
<div class="device">
 <div class="status-bar">
  <div class="status-left">
   <span class="status-dot" id="statusDot"></span>
   <span class="status-text" id="statusText">Ready</span>
  </div>
  <div class="status-right">
   <span class="conn-indicator" id="connIndicator">,··</span>
   <span class="battery-indicator"> 84%</span>
  </div>
 </div>
 <div class="kit-frame">
  <div class="kit-hinge"></div>
  <div class="kit-header">
   <div class="label" id="kitHeaderLabel">SmartAid Kit</div>
   <div class="kit-header-title-row">
    <svg class="kit-header-cross" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
     <rect x="1" y="1" width="22" height="22" rx="6" fill="#fff"/>
     <path d="M11 5h2v5h5v2h-5v5h-2v-5H6v-2h5V5z" fill="#990011"/>
    </svg>
    <h1 id="headerTitle">What's happening?</h1>
   </div>
  </div>

  <div class="screen" id="homeScreen">
   <div class="first-use-hint" id="firstUseHint"></div>

   <div class="lid-panel">
    <div class="lid-label" id="lidLabel">Smart Device System</div>
    <div class="lid-controls">
     <div class="lid-part">
      <div class="lid-icon mic-icon"></div>
      <div class="lid-part-name" id="micPartName">Mic</div>
     </div>
     <div class="lid-part">
      <div class="lid-icon speaker-icon"></div>
      <div class="lid-part-name" id="speakerPartName">Speaker</div>
     </div>
    </div>
    <div class="lid-buttons">
     <button class="kit-btn assess-btn" id="micBtn" onclick="confirmPress('micBtn'); startListening()">
      <span class="kit-btn-icon" id="micIcon"></span>
      <span class="kit-btn-label" id="micLabel">Assess</span>
     </button>
     <button class="kit-btn help-btn" id="helpBtn" onclick="confirmPress('helpBtn'); alertFaculty()">
      <span class="kit-btn-icon"></span>
      <span class="kit-btn-label" id="helpLabel">Help</span>
     </button>
     <button class="kit-btn emergency-btn" id="emergencyBtn" onclick="confirmPress('emergencyBtn'); alertClinic('manual')">
      <span class="kit-btn-icon"></span>
      <span class="kit-btn-label" id="emergencyLabel">Emergency</span>
     </button>
    </div>
    <div class="lid-btn-captions">
     <span id="captionAssess">Record &amp; guide</span>
     <span id="captionHelp">Notify Sickbay/Med Assistant</span>
     <span id="captionEmergency">Go straight to clinic/ambulance</span>
    </div>
    <div id="micStatus" class="mic-status hidden"></div>
   </div>

   <div class="tray-panel">
    <div class="tray-label" id="trayLabel">Supply tray , tap an item, or use Assess above</div>
    <div class="tray-grid" id="optionsGrid"></div>
   </div>
  </div>


   <!-- Voice settings bar -->
   <div class="voice-bar" id="voiceBar">
    <div class="voice-bar-header" onclick="toggleVoicePanel()">
     <span class="voice-bar-title"> Voice settings</span>
     <span class="voice-active-label" id="voiceActiveLabel">Browser default</span>
    </div>
    <div class="voice-panel" id="voicePanel">

     <div class="voice-section-title">Voice engine</div>

     <!-- Option 1: ElevenLabs AI -->
     <div class="voice-option-row" id="voiceOpt_eleven" onclick="selectVoiceEngine('eleven')">
      <div class="voice-option-dot"></div>
      <div class="voice-option-info">
       <div class="voice-option-name">ElevenLabs AI Voice <span class="voice-option-badge badge-live">BEST QUALITY</span></div>
       <div class="voice-option-sub">Real African English accent , requires API key</div>
      </div>
     </div>

     <!-- Option 2: Device / Browser TTS -->
     <div class="voice-option-row selected" id="voiceOpt_browser" onclick="selectVoiceEngine('browser')">
      <div class="voice-option-dot"></div>
      <div class="voice-option-info">
       <div class="voice-option-name">Browser voice <span class="voice-option-badge badge-browser">DEFAULT</span></div>
       <div class="voice-option-sub">Uses voices installed on this device , varies by system</div>
      </div>
     </div>

     <!-- Option 3: Pre-recorded audio -->
     <div class="voice-option-row" id="voiceOpt_recorded" onclick="selectVoiceEngine('recorded')">
      <div class="voice-option-dot"></div>
      <div class="voice-option-info">
       <div class="voice-option-name">Pre-recorded audio <span class="voice-option-badge badge-device">HARDWARE</span></div>
       <div class="voice-option-sub">For physical device , audio files on SD card</div>
      </div>
     </div>

     <!-- ElevenLabs settings (shown when eleven selected) -->
     <div class="voice-api-section" id="voiceApiSection" style="display:none">
      <div class="voice-api-label"> ElevenLabs settings</div>
      <input class="voice-api-input" type="password" id="elevenApiKey"
       placeholder="Paste your ElevenLabs API key here"
       oninput="updateElevenKey(this.value)" />
      <select class="voice-api-select" id="elevenVoiceId" onchange="updateElevenVoice(this.value)">
       <option value="pMsXgVXv3BLzUgSXRplE">Amara , African English (Warm, calm)</option>
       <option value="IKne3meq5aSn9XLyUdCD">Charlie , Nigerian English accent</option>
       <option value="N2lVS1w4EtoT3dr4eOWO">Callum , East African English</option>
       <option value="onwK4e9ZLuTAKqWW03F9">Daniel , African English (clear, authoritative)</option>
       <option value="z9fAnlkpzviPz146aGWa">Giovanni , multilingual, African-trained</option>
      </select>
      <button class="voice-test-btn" onclick="testElevenVoice()">▶ Test this voice</button>
      <button class="voice-save-btn" onclick="saveVoiceSettings()">Save settings</button>
      <div class="voice-error-note hidden" id="elevenErrorNote"></div>
      <div class="voice-info-note">
       Free tier: 10,000 characters/month.<br>
       Get your API key at elevenlabs.io → Profile → API Key.<br>
       Key is stored locally on this device only.
      </div>
     </div>

     <!-- Browser voice selector (shown when browser selected) -->
     <div class="voice-api-section" id="voiceBrowserSection">
      <div class="voice-api-label"> Select voice</div>
      <select class="voice-api-select" id="browserVoiceSelect" onchange="setBrowserVoice(this.value)">
       <option value="">Loading voices...</option>
      </select>
      <button class="voice-test-btn" onclick="testBrowserVoice()">▶ Test this voice</button>
      <div class="voice-info-note">
       For African English: look for en-NG (Nigerian), en-ZA (South African), en-KE (Kenyan), or en-GH (Ghanaian) in the list above.<br>
       If no African voices appear, install them via your device system settings.
      </div>
      <div class="voice-fallback-note hidden" id="voiceFallbackNote"></div>
     </div>

     <!-- Pre-recorded audio settings (shown when recorded selected) -->
     <div class="voice-api-section" id="voiceRecordedSection" style="display:none">
      <div class="voice-api-label"> Pre-recorded audio</div>
      <label class="voice-file-label" for="recordingUpload" id="recordingUploadLabel">Upload your own recordings</label>
      <input class="voice-api-input" type="file" id="recordingUpload" accept="audio/*" multiple>
      <div class="voice-info-note" id="recordingHint">
       Record each guidance line on your phone's voice recorder app, save as separate files, then select them all here. Name them to match the order: bleeding, burn, headache, fainting, allergic, sprain, eyeinjury, nosebleed. Your recordings take priority over the system voice automatically.
      </div>
     </div>

    </div>
   </div>

   <!-- Stock tracking bar -->
   <div class="stock-bar" id="stockBar">
    <div class="stock-bar-header" onclick="toggleStockPanel()">
     <span class="stock-bar-title" id="stockBarTitle"> Kit stock , all items ready</span>
     <div style="display:flex;align-items:center;gap:8px">
      <span class="stock-status-dot" id="stockDot"></span>
      <button class="stock-setup-btn" onclick="event.stopPropagation();showScreen('setupScreen');renderSetupScreen()" title="Kit setup"> Setup</button>
     </div>
    </div>
    <div class="stock-panel" id="stockPanel">
     <div id="stockItemList"></div>
     <div id="stockRestockMsg" class="stock-restock-msg" style="display:none"></div>
     <button class="stock-restock-btn hidden" id="stockRestockBtn" onclick="showScreen('setupScreen');renderSetupScreen()"> Restock now → </button>
     <button class="stock-clear-btn" onclick="clearStockLog()" id="stockClearBtn" style="display:none"> Items restocked , mark as full</button>
    </div>
   </div>

   <!-- Language , placed right under Kit stock so it's easy to reach -->
   <div class="lang-bar">
    <span class="lang-bar-label" id="langSwitcherLabel">Language</span>
    <div class="lang-switcher">
     <button class="lang-btn" id="langBtnEn" onclick="setLanguage('en')">EN</button>
     <button class="lang-btn" id="langBtnFr" onclick="setLanguage('fr')">FR</button>
     <button class="lang-btn" id="langBtnRw" onclick="setLanguage('rw')">RW</button>
    </div>
   </div>
 </div>

 <div class="screen hidden" id="guidanceScreen">
  <button class="back-link" id="backLink1" onclick="goHome()">&larr; Back</button>
  <div id="correctionBanner" class="correction-banner hidden"></div>
  <div id="multiSummary" class="multi-summary hidden"></div>
  <div class="tag-row">
   <div class="situation-tag" id="situationTag"></div>
   <div class="log-timestamp" id="logTimestamp"></div>
  </div>
  <div id="urgencyNote" class="urgency-note hidden"></div>
  <p class="guidance-text" id="guidanceIntro"></p>

  <!-- 2.8-inch screen simulation panel , syncs with each step -->
  <div class="anim-screen-wrap" id="animScreenWrap">
   <div class="anim-screen-label"> Visual Guide , 2.8" display</div>
   <div class="anim-screen" id="animScreen">
    <svg id="animSvg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
     <rect width="200" height="150" fill="#1C1C1A"/>
     <text x="100" y="80" text-anchor="middle" fill="#555552" font-size="12" font-family="Arial">Waiting for situation...</text>
    </svg>
   </div>
   <div class="anim-step-label" id="animStepLabel"></div>
  </div>

  <ol class="steps" id="stepsList"></ol>
  <!-- Done banner , shown automatically when steps finish speaking -->
  <div class="guidance-done-banner" id="guidanceDoneBanner">
   <div class="guidance-done-text">
    <b> All steps complete</b>
    Steps are still shown above , read them or replay anytime.
   </div>
   <button class="guidance-replay-btn" onclick="speakGuidance()"> Replay</button>
  </div>

  <!-- Restock banner , shown if items are low after this emergency -->
  <div class="guidance-restock-banner" id="guidanceRestockBanner">
   <div class="guidance-restock-title"> Items used , restock before next emergency</div>
   <div class="guidance-restock-items" id="guidanceRestockItems"></div>
   <button class="guidance-restock-btn" onclick="showFullRestockScreen()">View full restock details →</button>
  </div>

  <button class="speak-btn" id="speakBtn" onclick="speakGuidance()"> <span id="speakBtnLabel">Repeat steps out loud</span></button>
  <div id="queueBox" class="queue-box hidden"></div>
  <div class="escalate-note" id="escalateNote">If this needs more than first aid: press Help to notify Sickbay/Med Assistant, or Emergency to go straight to the clinic/ambulance.</div>
  <div class="guidance-action-row">
   <button class="help-action-btn" onclick="alertFaculty()">‍ <span id="helpActionLabel">Help , notify Sickbay/Med Assistant</span></button>
   <button class="emergency-action-btn" onclick="alertClinic('manual')"> <span id="emergencyActionLabel">Emergency , clinic/ambulance now</span></button>
  </div>
 </div>

 <!-- ── TRIAGE SCREEN , voice driven ────────────────────────── -->
 <div class="screen hidden" id="triageScreen">
  <button class="back-link" onclick="goHome()">&larr; Back</button>
  <div class="triage-situation-tag" id="triageSituationTag"></div>
  <p class="triage-question" id="triageQuestion"></p>

  <!-- Listening animation while waiting for voice answer -->
  <div class="triage-listen-box" id="triageListenBox">
   <div class="triage-pulse-ring"></div>
   <div class="triage-mic-icon"></div>
   <p class="triage-listen-label" id="triageListenLabel">Listening...</p>
  </div>

  <!-- What was heard + result -->
  <div class="triage-heard-box hidden" id="triageHeardBox">
   <span class="triage-heard-text" id="triageHeardText"></span>
  </div>

  <!-- Fallback tap buttons , only shown if voice fails -->
  <div class="triage-fallback hidden" id="triageFallback">
   <p class="triage-fallback-label" id="triageFallbackLabel">Tap if voice is not working:</p>
   <div class="triage-options" id="triageOptions"></div>
  </div>
 </div>

 <div class="screen hidden alert-screen" id="alertScreen">
  <div class="pulse-dot">!</div>
  <div class="alert-status" id="alertStatus">Alert sent</div>
  <div class="alert-sub" id="alertSub">Notifying the on-site responsible contact now.</div>
  <div class="timer-box" id="timerBox">
   <div class="timer-label" id="timerLabel">Waiting for Sickbay/Med Assistant response</div>
   <div class="timer-value" id="timerValue">00:10</div>
  </div>
  <button class="emergency-now-btn hidden" id="emergencyNowBtn" onclick="alertClinic('manual')">
    <span id="emergencyNowLabel">Escalate to clinic/ambulance now</span>
  </button>
  <div class="escalated-box hidden" id="escalatedBox"></div>

  <!-- Shown when help/emergency was pressed directly, with no situation
       chosen yet , lets the person say what's wrong so we can still guide
       them step by step while they wait, not just when they went through Assess. -->
  <div class="quick-situation-box hidden" id="quickSituationBox">
   <div class="quick-situation-label" id="quickSituationLabel"> What's wrong? So we can guide you while you wait:</div>
   <div class="quick-situation-grid" id="quickSituationGrid"></div>
  </div>

  <!-- Animation screen , shown during waiting steps -->
  <div class="anim-screen-wrap hidden" id="alertAnimWrap">
   <div class="anim-screen-label"> Visual Guide , follow each step on screen</div>
   <div class="anim-screen" id="alertAnimScreen">
    <svg id="alertAnimSvg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
     <rect width="200" height="150" fill="#1C1C1A"/>
     <text x="100" y="80" text-anchor="middle" fill="#555552" font-size="12" font-family="Arial">Emergency contacted...</text>
    </svg>
   </div>
   <div class="anim-step-label" id="alertAnimLabel"></div>
  </div>

  <!-- WHILE YOU WAIT steps -->
  <div class="waiting-steps-box hidden" id="waitingStepsBox">
   <div class="waiting-steps-header" id="waitingStepsHeader">⏳ While help is on the way:</div>
   <ol class="waiting-steps-list" id="waitingStepsList"></ol>
   <button class="waiting-speak-btn" id="waitingSpeakBtn" onclick="speakWaitingSteps(window._currentTriageKey || currentSituation)">
     <span id="waitingSpeakLabel">Read all steps out loud , step by step</span>
   </button>
  </div>

  <button class="reset-btn" id="resetBtn" onclick="resetAll()">Start over</button>
 </div>

 <div class="screen hidden setup-screen" id="setupScreen">
  <div class="setup-header-bar">
   <div>
    <div class="setup-header-title">Kit setup</div>
    <div class="setup-header-sub">Set quantities and restock alert threshold</div>
   </div>
   <button class="setup-save-btn" onclick="saveSetup()">Save</button>
  </div>

  <div class="setup-section-label">Stock levels</div>
  <div id="setupItemList"></div>

  <div class="setup-section-label">Low-stock alert threshold</div>
  <div style="padding: 0 16px 16px;">
   <label for="setupThreshold" style="display:block;font-size:11px;color:#888780;margin-bottom:8px;">Alert when a consumable drops to:</label>
   <input id="setupThreshold" type="number" min="0" max="10" value="1" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid #2E2E2C;background:#141412;color:#E0D4C0;font-size:13px;font-family:inherit;box-sizing:border-box;" />
   <button class="setup-save-btn" onclick="resetSetupToDefaults()" style="margin-top:12px;width:100%;">Reset to defaults</button>
  </div>
 </div>

 <div class="screen hidden restock-screen" id="restockScreen">
  <button class="back-link" id="backLinkRestock" onclick="showScreen('homeScreen')">&larr; Back</button>
  <div id="restockHeader" class="restock-header"> Kit restock recommended</div>
  <div id="restockSub" class="restock-sub">The following items used in this emergency are now low or empty. Please restock before the next emergency.</div>
  <div id="restockItemList"></div>
  <div class="restock-sms-label">SMS preview</div>
  <div id="restockSmsText" class="restock-sms"></div>
  <button class="restock-done-btn" onclick="markRestocked()"> Mark as restocked</button>
 </div>

 <div class="log-link"><button onclick="toggleLog()" id="logLinkBtn">View activity log (demo data)</button></div>
 <div class="screen hidden" id="logScreen">
  <button class="back-link" id="backLink2" onclick="toggleLog()">&larr; Back</button>
  <p class="prompt" id="logPrompt">Every use gets logged like this , useful evidence for your pitch and for spotting what's needed most.</p>
  <ul id="logList"></ul>
 </div>

</div>

<audio id="audioPlayer" class="hidden"></audio>
`;

export default bodyMarkup;
