
// This script loads via next/script's afterInteractive strategy, i.e. after
// the document's native DOMContentLoaded has already fired. Any
// document.addEventListener('DOMContentLoaded', ...) registered below would
// therefore never run. Use this helper instead: it runs the callback right
// away if the DOM is already parsed, and only falls back to the event for
// the (non-Next.js) case where this script is loaded normally in <head>.
function _onDomReady(fn) {
 if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fn);
 } else {
  fn();
 }
}

// ═════════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS , this file is the entire client-side app logic
// (there is no backend/server; app/bodyMarkup.js holds the HTML and
// app/globals.css holds the styling , see README.md). Search for any
// of these banner titles to jump straight to that part:
//
//   TRANSLATIONS                 , UI strings per language (en/fr/rw)
//   SITUATION CONTENT            , per-situation labels/keywords/guidance text
//   TRIAGE DATA                  , minor/moderate/severe steps per situation
//   ANIMATION DATA                , SVG step-by-step animation frames
//   SITUATION METADATA & LOOKUP  , icons, priority, display order
//   CORE APP STATE               , the few top-level mutable variables
//   SCREEN / STATUS UI HELPERS   , language switch, status pill, connection clock
//   VOICE RECOGNITION            , Web Speech input + fuzzy situation matching
//   TRIAGE FLOW                  , severity picker, guidance screen population
//   RELIABLE SEQUENTIAL SPEECH ENGINE , queued step-by-step narration
//   VOICE ENGINE SYSTEM          , browser TTS / ElevenLabs / recorded audio
//   STOCK TRACKING ENGINE        , kit item quantities, thresholds, restock UI
//   GUIDANCE DONE STATE          , end-of-guidance banners and repeat prompt
//   NAVIGATION, RESET & ALERT/ESCALATION FLOW , Help/Emergency buttons,
//                                   waiting-step guidance while help is on the way
//   TIMER, SCREEN SWITCHING & ACTIVITY LOG
// ═════════════════════════════════════════════════════════════════════

// ── TRANSLATIONS (English / French / Kinyarwanda UI strings) ───────────
const UI = {
 en: {
  statusReady: "Ready", statusListening: "Listening...", statusGuidance: "Guidance: ",
  statusWaiting: "Waiting on Sickbay/Med Assistant", statusClinic: "Clinic/Ambulance notified",
  connConnected: " Connected, ", connJustNow: "checked just now", connAgo: "checked {s}s ago",
  kitHeaderLabel: "SmartAid Kit, Prototype", headerHome: "What's happening?",
  headerGuide: "Step 2: Guide", headerHelp: "Help: alerting Sickbay/Med Assistant", headerEmergency: "Emergency: clinic/ambulance notified",
  firstUseHint: " First time? Press <b>Assess</b> to begin.",
  lidLabel: "Smart Device System", micPartName: "Mic", speakerPartName: "Speaker",
  micLabel: "Assess", micListening: "Listening...", helpLabel: "Help", emergencyLabel: "Emergency",
  captionAssess: "Record & guide", captionHelp: "Notify Sickbay/Med Assistant", captionEmergency: "Go straight to clinic/ambulance",
  trayLabel: "Supply tray , tap an item, or use Assess above",
  speakNow: "Speak now , describe what's happening.",
  micUnsupported: "Voice input isn't supported in this browser , try Chrome, or use the buttons below.",
  micNoMatch: "Heard: \"{t}\" , couldn't match a situation. Try again or choose below.",
  micHeard: "Heard: \"{t}\"",
  didYouMean: "We heard \"{t}\" and guessed {label} , not certain, so please confirm.",
  notThis: "Not this",
  pickCorrect: "Tap the correct one:",
  micError: "Couldn't hear that ({e}). Try again or use the buttons below.",
  backLink: "← Back",
  speakBtnLabel: "Repeat steps out loud",
  escalateNote: "If this needs more than first aid: press Help to notify Sickbay/Med Assistant, or Emergency to go straight to the clinic/ambulance.",
  helpActionLabel: "Help , notify Sickbay/Med Assistant", emergencyActionLabel: "Emergency , clinic/ambulance now",
  queueUpNext: "Up next",
  multiSummary: "You mentioned {n} things. Starting with the most urgent , {first} , then we'll come back to: {rest}.",
  alertFacultyStatus: "Sickbay/Med Assistant notified", alertFacultySub: "Notifying the on-site Sickbay/Med Assistant now.",
  timerLabel: "Waiting for Sickbay/Med Assistant response", emergencyNowLabel: "Don't wait , alert clinic/ambulance now",
  clinicTimeoutStatus: "Escalated to clinic/ambulance", clinicTimeoutSub: "No response from Sickbay/Med Assistant in time , the clinic/ambulance has been notified automatically.",
  clinicTimeoutBox: "No response received from Sickbay/Med Assistant , clinic/ambulance notified automatically.",
  clinicManualStatus: "Clinic/Ambulance notified", clinicManualSub: "Going straight to the clinic/ambulance now , this didn't wait for Sickbay/Med Assistant.",
  clinicManualBox: "Sent directly to the clinic/ambulance , manual emergency override.",
  resetBtn: "Start over",
  logLinkBtn: "View activity log (demo data)",
  logPrompt: "Every use gets logged like this , useful evidence for your pitch and for spotting what's needed most.",
  logEmpty: "No activity yet this session , try a few scenarios first.",
  logAssessed: "Assessed: ", logFacultyAlert: "Sickbay/Med Assistant alert sent for: ",
  logEscalated: "Escalated to clinic/ambulance (no Sickbay/Med Assistant response): ", logManualClinic: "Clinic/Ambulance alerted directly (manual emergency): ",
  voiceSettingsSummary: "Voice settings",
  voiceSelectLabel: "System voice (uses whatever your device has installed)",
  voiceNoVoices: "No voices found yet , try reopening voice settings",
  voiceFallbackNote: " No Kinyarwanda voice found on this device. Guidance text will still show in Kinyarwanda, but spoken audio will use the closest available voice instead, or your own uploaded recording.",
  recordingUploadLabel: "Or use your own recording instead (recommended)",
  recordingHint: "Record each guidance line on your phone's voice recorder app, save as separate files, then select them all here. Name them to match the order: bleeding, burn, headache, fainting, allergic, sprain, eyeinjury, nosebleed. Your recordings take priority over the system voice automatically.",
  recordingLoaded: "Loaded {n} recording(s). They'll play in this order: {list}."
 },
 fr: {
  statusReady: "Prêt", statusListening: "Écoute...", statusGuidance: "Conseil: ",
  statusWaiting: "En attente du personnel", statusClinic: "Clinique alertée",
  connConnected: " Connecté, ", connJustNow: "vérifié à l'instant", connAgo: "vérifié il y a {s}s",
  kitHeaderLabel: "SmartAid Kit, Prototype", headerHome: "Que se passe-t-il ?",
  headerGuide: "Étape 2: Conseils", headerHelp: "Aide: alerte au personnel", headerEmergency: "Urgence: clinique alertée",
  firstUseHint: " Première fois ? Appuyez sur <b>Évaluer</b> pour commencer.",
  lidLabel: "Appareil , couvercle de la trousse", micPartName: "Micro", speakerPartName: "Haut-parleur",
  micLabel: "Évaluer", micListening: "Écoute...", helpLabel: "Aide", emergencyLabel: "Urgence",
  captionAssess: "Enregistrer et guider", captionHelp: "Alerter le personnel", captionEmergency: "Aller directement à la clinique",
  trayLabel: "Trousse de secours , touchez un élément, ou utilisez Évaluer ci-dessus",
  speakNow: "Parlez maintenant , décrivez ce qui se passe.",
  micUnsupported: "La saisie vocale n'est pas prise en charge par ce navigateur , essayez Chrome, ou utilisez les boutons ci-dessous.",
  micNoMatch: "Entendu: « {t} » , situation non reconnue. Réessayez ou choisissez ci-dessous.",
  micHeard: "Entendu: « {t} »",
  didYouMean: "Nous avons entendu « {t} » et deviné {label} , pas certain, merci de confirmer.",
  notThis: "Pas ça",
  pickCorrect: "Touchez la bonne situation :",
  micError: "Impossible d'entendre ({e}). Réessayez ou utilisez les boutons ci-dessous.",
  backLink: "← Retour",
  speakBtnLabel: "Répéter les étapes à voix haute",
  escalateNote: "Si cela nécessite plus que des premiers soins: appuyez sur Aide pour alerter le personnel, ou Urgence pour aller directement à la clinique.",
  helpActionLabel: "Aide , alerter le personnel", emergencyActionLabel: "Urgence , clinique maintenant",
  queueUpNext: "À suivre",
  multiSummary: "Vous avez mentionné {n} choses. On commence par la plus urgente , {first} , puis on reviendra à: {rest}.",
  alertFacultyStatus: "Personnel alerté", alertFacultySub: "Le personnel / centre de santé sur place est alerté maintenant.",
  timerLabel: "En attente de réponse du personnel", emergencyNowLabel: "N'attendez pas , alerter la clinique maintenant",
  clinicTimeoutStatus: "Transféré à la clinique", clinicTimeoutSub: "Pas de réponse du personnel à temps , la clinique voisine a été alertée automatiquement.",
  clinicTimeoutBox: "Aucune réponse du personnel reçue , clinique alertée automatiquement.",
  clinicManualStatus: "Clinique alertée", clinicManualSub: "Direction la clinique voisine maintenant , sans attendre le personnel.",
  clinicManualBox: "Envoyé directement à la clinique , déclenchement manuel d'urgence.",
  resetBtn: "Recommencer",
  logLinkBtn: "Voir le journal d'activité (données de démonstration)",
  logPrompt: "Chaque utilisation est enregistrée ainsi , une preuve utile pour votre présentation et pour repérer les besoins les plus fréquents.",
  logEmpty: "Aucune activité pour l'instant , essayez quelques scénarios d'abord.",
  logAssessed: "Évalué: ", logFacultyAlert: "Alerte au personnel envoyée pour: ",
  logEscalated: "Transféré à la clinique (pas de réponse du personnel): ", logManualClinic: "Clinique alertée directement (urgence manuelle): ",
  voiceSettingsSummary: "Paramètres vocaux",
  voiceSelectLabel: "Voix du système (utilise les voix installées sur votre appareil)",
  voiceNoVoices: "Aucune voix trouvée , essayez de rouvrir les paramètres vocaux",
  voiceFallbackNote: " Aucune voix en kinyarwanda trouvée sur cet appareil. Le texte s'affichera tout de même en kinyarwanda, mais l'audio utilisera la voix la plus proche disponible, ou votre propre enregistrement.",
  recordingUploadLabel: "Ou utilisez plutôt votre propre enregistrement (recommandé)",
  recordingHint: "Enregistrez chaque ligne de conseils avec l'enregistreur vocal de votre téléphone, sauvegardez-les séparément, puis sélectionnez-les toutes ici. Nommez-les dans cet ordre: bleeding, burn, headache, fainting, allergic, sprain, eyeinjury, nosebleed. Vos enregistrements remplacent automatiquement la voix du système.",
  recordingLoaded: "{n} enregistrement(s) chargé(s). Ils joueront dans cet ordre: {list}."
 },
 rw: {
  statusReady: "Biteguye", statusListening: "Kumva...", statusGuidance: "Inama: ",
  statusWaiting: "Gutegereza abarimu", statusClinic: "Ivuriro ryamenyeshejwe",
  connConnected: " Bihujwe, ", connJustNow: "byagenzuwe ubu", connAgo: "byagenzuwe {s}s ishize",
  kitHeaderLabel: "SmartAid Kit, Igerageza", headerHome: "Ikibazo nikihe?",
  headerGuide: "Intambwe 2: Inama", headerHelp: "Ubufasha: kumenyesha abarimu", headerEmergency: "Ibyihutirwa: ivuriro ryamenyeshejwe",
  firstUseHint: " Ubwa mbere? Kanda kuri <b>Suzuma</b> kugira ngo utangire.",
  lidLabel: "Igikoresho , igitebo cy'agasanduku", micPartName: "Mikoro", speakerPartName: "Ijwi",
  micLabel: "Suzuma", micListening: "Kumva...", helpLabel: "Ubufasha", emergencyLabel: "Ibyihutirwa",
  captionAssess: "Andika maze uhabwe inama", captionHelp: "Menyesha abarimu", captionEmergency: "Jya ku ivuriro ako kanya",
  trayLabel: "Agasanduku k'ubuvuzi , kanda ikintu, cyangwa ukoreshe Suzuma haruguru",
  speakNow: "Vuga ubu , sobanura ikibazo gihari.",
  micUnsupported: "Iyandikwa ry'ijwi ntirikorera kuri uyu mucukumbuzi , gerageza Chrome, cyangwa ukoreshe buto zo hasi.",
  micNoMatch: "Twumvise: \"{t}\" , ntitwabashije kumenya ikibazo. Ongera ugerageze cyangwa uhitemo hasi.",
  micHeard: "Twumvise: \"{t}\"",
  didYouMean: "Twumvise \"{t}\" maze tugerageza kumenya {label} , ntibyemejwe neza, nyamuneka emeza.",
  notThis: "Ntabwo ari ibi",
  pickCorrect: "Kanda ikibazo nyacyo:",
  micError: "Ntitwashoboye kumva neza ({e}). Ongera ugerageze cyangwa ukoreshe buto zo hasi.",
  backLink: "← Subira inyuma",
  speakBtnLabel: "Subiramo intambwe zivugwa",
  escalateNote: "Niba bikenera birenze ubuvuzi bw'ibanze: kanda Ubufasha kugira ngo umenyeshe abarimu, cyangwa Ibyihutirwa kugira ngo ujye ku ivuriro ako kanya.",
  helpActionLabel: "Ubufasha , menyesha abarimu", emergencyActionLabel: "Ibyihutirwa , ivuriro ubu",
  queueUpNext: "Bikurikira",
  multiSummary: "Wavuze ibintu {n}. Turatangira n'ikiri cy'ibyihutirwa , {first} , hanyuma tuzagaruka kuri: {rest}.",
  alertFacultyStatus: "Abarimu bamenyeshejwe", alertFacultySub: "Turimo kumenyesha abarimu / ivuriro ry'ishuri ubu.",
  timerLabel: "Gutegereza igisubizo cy'abarimu", emergencyNowLabel: "Ntutegereze , menyesha ivuriro ubu",
  clinicTimeoutStatus: "Byoherejwe ku ivuriro", clinicTimeoutSub: "Nta gisubizo cy'abarimu cyabonetse ku gihe , ivuriro ryegereye ryamenyeshejwe byikoresha.",
  clinicTimeoutBox: "Nta gisubizo cy'abarimu cyabonetse , ivuriro ryamenyeshejwe byikoresha.",
  clinicManualStatus: "Ivuriro ryamenyeshejwe", clinicManualSub: "Turajya ku ivuriro ryegereye ubu , tutategereje abarimu.",
  clinicManualBox: "Byoherejwe ku ivuriro ako kanya , byakozwe n'umukoresha ubwe ku byihutirwa.",
  resetBtn: "Subira ku ntangiriro",
  logLinkBtn: "Reba urutonde rw'ibikorwa (ibyitwazwa)",
  logPrompt: "Igikorwa cyose kiranditswa gutya , bigufasha mu kwerekana ibimenyetso no kumenya ibikenewe cyane.",
  logEmpty: "Nta gikorwa kirimo , gerageza ibintu bike mbere.",
  logAssessed: "Byasuzumwe: ", logFacultyAlert: "Itangazo ry'abarimu ryoherejwe kuri: ",
  logEscalated: "Byoherejwe ku ivuriro (nta gisubizo cy'abarimu): ", logManualClinic: "Ivuriro ryamenyeshejwe ako kanya (ibyihutirwa by'umukoresha): ",
  voiceSettingsSummary: "Igenamiterere ry'ijwi",
  voiceSelectLabel: "Ijwi rya sisitemu (rikoresha amajwi ari kuri iki gikoresho)",
  voiceNoVoices: "Nta jwi ryabonetse , gerageza gufungura igenamiterere ry'ijwi nanone",
  voiceFallbackNote: " Nta jwi ry'Ikinyarwanda ryabonetse kuri iki gikoresho. Inyandiko izakomeza kugaragara mu Kinyarwanda, ariko ijwi rizakoresha irindi jwi riboneka cyangwa irikoze wowe ubwawe.",
  recordingUploadLabel: "Cyangwa ukoreshe ijwi ryawe (birasabwa)",
  recordingHint: "Andika umurongo wa buri nama ukoresheje porogaramu y'andika amajwi kuri telefoni yawe, ubike ku buryo butandukanye, hanyuma uhitemo byose hano. Bishyire mu rutonde rumwe: bleeding, burn, headache, fainting, allergic, sprain, eyeinjury, nosebleed. Amajwi wanditse azakoreshwa mbere y'ay'isisitemu.",
  recordingLoaded: "Amajwi {n} yashyizwemo. Azumvikana muri ubu buryo: {list}."
 }
};

let currentLang = 'en';

function tr(key, vars) {
 vars = vars || {};
 let str = (UI[currentLang] && UI[currentLang][key]) || UI.en[key] || key;
 Object.keys(vars).forEach(function(k) { str = str.replace('{' + k + '}', vars[k]); });
 return str;
}

// ── SITUATION CONTENT (labels, voice-match keywords, guidance text) ────
const SITUATIONS_I18N = {
 en: {
  bleeding: { label: "Bleeding / cut", itemHint: "Gloves #9, Gauze #3, Bandage #1, Antiseptic #5, Scissors #10",
   keywords: ["bleeding","bleed","blood","cut","wound","scrape","gash","laceration","slash","slice","puncture","stab","injury","injured","hurt","deep cut","finger cut","hand cut","arm cut","leg cut","head cut","scalp cut","gushing","blood wont stop","blood not stopping","construction accident","tool cut","knife","glass cut","sharp object","open wound","flesh wound","losing blood","nail cut","razor","machine cut","factory injury","wire cut","fell on glass","broken skin","torn skin","bite wound","animal bite","dog bite","mosquito cut","workplace injury"],
   urgencyNote: "Start within the next minute or two , bleeding is easier to control early.",
   intro: "For a cut or scrape that's bleeding:",
   steps: ["Use the sterile gauze (item #3) , press firmly on the wound.","Hold pressure for 5 minutes without checking.","Once it slows, clean with antiseptic wipe (item #5).","Cover with a bandage (item #1) sized to the wound."],
   speak: "For bleeding, use the sterile gauze, item 3, and press firmly on the wound. Hold pressure for 5 minutes. Then clean with the antiseptic wipe, item 5, and cover with a bandage." },
  burn: { label: "Burn", itemHint: "Cool water, Non-stick gauze #4, Cold pack #6, Scissors #10",
   keywords: ["burn","burnt","burned","scald","hot","fire","flame","heat","boiling","hot water","steam","chemical burn","acid burn","electric burn","electrical","sunburn","friction burn","rope burn","iron burn","cooking burn","kitchen accident","stove","oven","welding","welding burn","chemical splash","acid splash","bleach","hot liquid","hot food","hot surface","thermal injury","touching fire","fire accident","campfire burn","lab accident","school lab","chemistry accident","barbecue","smoke","hot metal"],
   urgencyNote: "Start within the next minute or two , cooling a burn quickly limits the damage.",
   intro: "For a minor burn:",
   steps: ["Run cool (not cold) water over it for 10 minutes.","Do not apply ice directly.","Cover loosely with a sterile, non-stick gauze (item #4).","Do not pop any blisters that form."],
   speak: "For a burn, run cool water over it for 10 minutes. Do not use ice. Cover loosely with the non-stick gauze, item 4." },
  headache: { label: "Headache", itemHint: "Pain relief #7 (if approved)",
   keywords: ["headache","head","migraine","pain in my head","head pain","head hurts","head ache","throbbing","pounding head","pressure in head","temple pain","forehead pain","dehydrated","dehydration","no water","thirsty","heat headache","sun headache","stress headache","exam stress","overworked","tired head","dizziness","dizzy head","nausea with head","head spinning","vertigo","light headed","lightheaded","heat exhaustion","sun exposure","too much sun","screen headache","eye strain","tension headache","cluster headache","neck pain","stiff neck with headache"],
   urgencyNote: "No rush , this can wait a few minutes once anything more urgent is handled.",
   intro: "For a headache:",
   steps: ["Sit down somewhere quiet and drink water first.","If approved at your institution, basic pain relief (item #7) may be used as labeled.","If it's severe, sudden, or with vision changes, skip this and press Alert now."],
   speak: "For a headache, sit down, drink water, and rest. If approved, basic pain relief, item 7, may be used as labeled. If it's severe or sudden, press alert now." },
  fainting: { label: "Fainting", itemHint: "No item needed , lay flat, raise legs, loosen clothing",
   keywords: ["faint","fainted","fainting","passed out","collapsed","unconscious","dizzy","unresponsive","not responding","fell down","on the floor","lost consciousness","blacked out","syncope","heat stroke","heat collapse","exhaustion collapse","overheated","too hot","low blood sugar","hunger faint","not eaten","diabetic","weak","legs gave out","went down","dropped","she fell","he fell","they dropped","cant wake up","wont wake up","not waking","eyes rolled","seizure","shaking","convulsion","fitting","fit","epilepsy","epileptic","seizure disorder","spasm","body shaking","uncontrolled shaking","not conscious","breathing but out","pale and sweating","sweating and weak"],
   urgencyNote: "Act right now , check breathing immediately, this can't wait.",
   intro: "If someone has fainted:",
   steps: ["Lay them flat and raise their legs slightly.","Loosen anything tight around their neck.","Check they're breathing normally.","This always needs an adult , press Alert now."],
   speak: "If someone has fainted, lay them flat, raise their legs slightly, and loosen anything tight around their neck. This always needs an adult. Press alert now." },
  allergic: { label: "Allergic reaction", itemHint: "Antihistamine #8 (if mild only)",
   keywords: ["allergic","allergy","reaction","swelling","rash","hives","throat","anaphylaxis","bee sting","wasp sting","insect sting","bug bite","ant bite","spider bite","snake bite","plant reaction","food allergy","nut allergy","peanut","seafood reaction","egg allergy","milk allergy","latex allergy","drug reaction","medication reaction","penicillin","antibiotic reaction","face swelling","lip swelling","tongue swelling","throat closing","cant breathe","difficulty breathing","breathing problem","wheezing","itching","itchy skin","itchy eyes","itchy throat","skin reaction","swollen face","swollen lips","hives all over","body rash","burning skin","red patches","welts","throat tightening","chest tightening","shortness of breath","epipen","swollen tongue","choking feeling"],
   urgencyNote: "Act right now , check for swelling or breathing trouble immediately.",
   intro: "For a suspected allergic reaction:",
   steps: ["Check for swelling of the face, lips, or throat, or difficulty breathing.","If any of those are present, this is an emergency , press Alert immediately.","If mild (skin rash only), basic antihistamine (item #8) may be used as labeled."],
   speak: "For an allergic reaction, check for swelling of the face, lips, or throat, or difficulty breathing. If present, press alert immediately. If mild, with a skin rash only, basic antihistamine, item 8, may be used as labeled." },
  sprain: { label: "Sprain / strain", itemHint: "Cold pack #6, Elastic bandage #2",
   keywords: ["sprain","sprained","twisted","ankle","strain","swollen joint","sprained ankle","sprained wrist","sprained knee","twisted ankle","twisted knee","rolled ankle","twisted foot","joint pain","swollen knee","swollen ankle","swollen wrist","muscle strain","pulled muscle","torn muscle","muscle tear","knee pain","wrist pain","shoulder pain","elbow pain","hip pain","back strain","lower back","sports injury","gym injury","running injury","football injury","soccer injury","basketball injury","volleyball injury","fell and hurt","fell and twisted","stairs injury","tripped","stumbled","hiking injury","walking injury","outdoor injury","field injury","limping","cant walk","cant move","joint out","dislocated","dislocation","fracture","broken bone","broken arm","broken leg","broken wrist","fractured","snap sound","heard a pop","bone pain","swelling after fall","bruise after fall"],
   urgencyNote: "Within the next few minutes is fine , rest the area while you wait if needed.",
   intro: "For a sprain or twisted joint:",
   steps: ["Rest the area , stop using it right away.","Apply a cold pack (item #6), wrapped in cloth, for 15 minutes.","Wrap with the elastic bandage (item #2) if swelling continues.","If unable to bear weight or move it, press Alert now."],
   speak: "For a sprain, rest the area, apply the cold pack, item 6, wrapped in cloth for 15 minutes, and wrap with the elastic bandage, item 2." },
  eyeinjury: { label: "Eye injury", itemHint: "Eye wash, Sterile eye pad",
   keywords: ["eye","eyes","eyeball","vision","sight","dust in eye","something in eye","chemical","splash","eye hurt","eye injury","eye pain","sore eye","red eye","watering eye","tearing eye","blurry vision","blurred vision","vision problem","cant see","seeing spots","chemical in eye","acid in eye","bleach in eye","soap in eye","sand in eye","grit in eye","foreign object in eye","particle in eye","glass in eye","metal in eye","wood splinter eye","contact lens stuck","contact lens problem","eye burning","eye irritation","eye infection","swollen eye","black eye","hit in eye","punched in eye","eye hit","object hit eye","punctured eye","eye scratch","cornea scratch","welder flash","arc flash","uv light eye","laboratory eye","factory eye","sawdust eye","construction dust eye","welding eye"],
   priority: 2,
   urgencyNote: "Act within the next few minutes , do not rub the eye, it makes it worse.",
   intro: "For an eye injury , dust, chemical, or foreign object:",
   steps: ["Do NOT rub the eye under any circumstances.","Use eye wash solution (item #11) to rinse gently for 10 to 15 minutes.","If a chemical splash: rinse immediately and continuously for at least 15 minutes.","Cover gently with a sterile eye pad (item #12) , do not press hard on the eye.","Press Help now , all eye injuries need a medical professional to check."],
   speak: "For an eye injury, do not rub the eye. Use the eye wash solution, item 11, to rinse gently for 10 to 15 minutes. If it was a chemical splash, rinse immediately for at least 15 minutes. Cover with the sterile eye pad, item 12. Press Help now." },
  nosebleed: { label: "Nosebleed", itemHint: "Cold pack #6, Gauze #3",
   keywords: ["nose","nosebleed","bleeding nose","nose bleed","blood from nose","nasal","nose bleeding","bleeding from nose","blood running from nose","nose wont stop","nose hit","hit in nose","punch in nose","ball hit nose","head impact nose","dry nose","nose blood","epistaxis","picking nose bleeding","after fall nose bleed","sport nose bleed","gym nose bleed","construction dust nose bleed","altitude nose bleed","heat nose bleed","dehydration nose bleed","blood on face","blood dripping face","nose gushing","nosebleed wont stop","blood from nostrils"],
   priority: 3,
   urgencyNote: "Stay calm , most nosebleeds stop within 10 minutes with correct technique.",
   intro: "For a nosebleed:",
   steps: ["Sit upright , do NOT tilt the head backward.","Pinch the soft part of the nose firmly for 10 minutes without releasing.","Breathe through the mouth while pinching.","Apply cold pack (item #6) wrapped in cloth to the bridge of the nose.","If bleeding does not stop after 20 minutes, press Help now."],
   speak: "For a nosebleed, sit upright and do not tilt the head back. Pinch the soft part of the nose firmly for 10 minutes without releasing. Apply the cold pack, item 6, to the bridge of the nose. If it does not stop after 20 minutes, press Help now." }
 },
 fr: {
  bleeding: { label: "Saignement / coupure", itemHint: "Gants #9, Gaze #3, Pansement #1, Antiseptique #5, Ciseaux #10",
   keywords: ["saigne","saignement","sang","coupure","blessure","plaie","éraflure","lacération","entaille","plaie ouverte","coupure profonde","blessure grave","accident de travail","coupure au doigt","coupure à la main","coupure à la tête","cuir chevelu","sang qui coule","sang qui ne s arrête pas","morsure","accident chantier","machine","outil coupant","verre","objet tranchant"],
   urgencyNote: "Commencez dans la minute ou deux , un saignement est plus facile à contrôler tôt.",
   intro: "Pour une coupure ou éraflure qui saigne :",
   steps: ["Utilisez la gaze stérile (article n°3) , appuyez fermement sur la plaie.","Maintenez la pression pendant 5 minutes sans vérifier.","Une fois que ça ralentit, nettoyez avec une lingette antiseptique (article n°5).","Couvrez avec un pansement (article n°1) adapté à la taille de la plaie."],
   speak: "Pour un saignement, utilisez la gaze stérile, article 3, et appuyez fermement sur la plaie. Maintenez la pression pendant 5 minutes. Ensuite, nettoyez avec la lingette antiseptique, article 5, et couvrez avec un pansement." },
  burn: { label: "Brûlure", itemHint: "Eau fraîche, Gaze non adhésive #4, Pack froid #6, Ciseaux #10",
   keywords: ["brûlure","brûlé","brûlée","échaudé","chaud","feu","flamme","chaleur","eau bouillante","vapeur","brûlure chimique","acide","électrique","coup de soleil","friction","accident cuisine","four","cuisinière","laboratoire","soudure","liquide chaud","métal chaud","brûlure thermique","accident scolaire","barbecue","chimie"],
   urgencyNote: "Commencez dans la minute ou deux , refroidir rapidement une brûlure limite les dégâts.",
   intro: "Pour une brûlure légère :",
   steps: ["Faites couler de l'eau fraîche (pas froide) pendant 10 minutes.","N'appliquez pas de glace directement.","Couvrez sans serrer avec une gaze stérile non adhésive (article n°4).","Ne percez pas les cloques qui se forment."],
   speak: "Pour une brûlure, faites couler de l'eau fraîche pendant 10 minutes. N'utilisez pas de glace. Couvrez sans serrer avec la gaze non adhésive, article 4." },
  headache: { label: "Mal de tête", itemHint: "Antidouleur #7 (si autorisé)",
   keywords: ["mal de tête","tête","migraine","douleur à la tête","tête qui fait mal","pression dans la tête","déshydraté","déshydratation","coup de chaleur","stress","fatigue","vertiges","nausée","tête qui tourne","exposition au soleil","tension","nuque raide"],
   urgencyNote: "Pas d'urgence , cela peut attendre quelques minutes une fois l'urgent traité.",
   intro: "Pour un mal de tête :",
   steps: ["Asseyez-vous dans un endroit calme et buvez de l'eau d'abord.","Si autorisé dans votre établissement, un antidouleur de base (article n°7) peut être utilisé selon l'étiquette.","Si c'est sévère, soudain, ou avec des troubles de la vision, ignorez ceci et appuyez sur Aide maintenant."],
   speak: "Pour un mal de tête, asseyez-vous, buvez de l'eau, et reposez-vous. Si autorisé, un antidouleur de base, article 7, peut être utilisé selon l'étiquette. Si c'est sévère ou soudain, appuyez sur alerte maintenant." },
  fainting: { label: "Évanouissement", itemHint: "Aucun article , allonger, lever les jambes, desserrer",
   keywords: ["évanoui","évanouissement","perdu connaissance","effondré","inconscient","vertige","ne répond pas","tombe","tombé","est tombé","hypoglycémie","convulsion","crise","tremblement","coup de chaleur","faiblesse","pâle","sueur froide","ne se réveille pas"],
   urgencyNote: "Agissez immédiatement , vérifiez la respiration tout de suite, cela ne peut pas attendre.",
   intro: "Si quelqu'un s'est évanoui :",
   steps: ["Allongez-le et surélevez légèrement ses jambes.","Desserrez tout ce qui est ajusté autour du cou.","Vérifiez qu'il respire normalement.","Cela nécessite toujours un adulte , appuyez sur Aide maintenant."],
   speak: "Si quelqu'un s'est évanoui, allongez-le, surélevez légèrement ses jambes, et desserrez tout ce qui est ajusté autour du cou. Cela nécessite toujours un adulte. Appuyez sur alerte maintenant." },
  allergic: { label: "Réaction allergique", itemHint: "Antihistaminique #8 (si léger seulement)",
   keywords: ["allergique","allergie","réaction","gonflement","éruption","urticaire","gorge","anaphylaxie","piqûre abeille","piqûre guêpe","insecte","morsure araignée","allergie alimentaire","arachides","fruits de mer","médicament","pénicilline","visage gonflé","lèvres gonflées","gorge qui se ferme","difficultés respiratoires","sifflement","démangeaison","peau qui brûle","éruption cutanée","boutons"],
   urgencyNote: "Agissez immédiatement , vérifiez le gonflement ou les difficultés respiratoires tout de suite.",
   intro: "Pour une suspicion de réaction allergique :",
   steps: ["Vérifiez un gonflement du visage, des lèvres, ou de la gorge, ou des difficultés à respirer.","Si l'un de ces signes est présent, c'est une urgence , appuyez sur Alerte immédiatement.","Si léger (éruption cutanée seulement), un antihistaminique de base (article n°8) peut être utilisé selon l'étiquette."],
   speak: "Pour une réaction allergique, vérifiez un gonflement du visage, des lèvres, ou de la gorge, ou des difficultés à respirer. Si présent, appuyez sur alerte immédiatement. Si léger, avec seulement une éruption cutanée, un antihistaminique de base, article 8, peut être utilisé selon l'étiquette." },
  sprain: { label: "Entorse / foulure", itemHint: "Pack froid #6, Bandage élastique #2",
   keywords: ["entorse","foulure","tordu","cheville","foulé","articulation gonflée","genou","poignet","douleur articulaire","muscle déchiré","chute","sport","football","course","escaliers","fracture","os cassé","dislocation","luxation","bruit de craquement","ne peut pas marcher","boiteux","gonflement après chute","bleu après chute"],
   urgencyNote: "Quelques minutes d'attente sont acceptables , reposez la zone en attendant si nécessaire.",
   intro: "Pour une entorse ou une articulation tordue :",
   steps: ["Reposez la zone , arrêtez de l'utiliser immédiatement.","Appliquez un pack froid (article n°6), enveloppé dans un tissu, pendant 15 minutes.","Enveloppez avec le bandage élastique (article n°2) si le gonflement continue.","Si incapable de porter du poids ou de bouger, appuyez sur Alerte maintenant."],
   speak: "Pour une entorse, reposez la zone, appliquez le pack froid, article 6, enveloppé dans un tissu pendant 15 minutes, et enveloppez avec le bandage élastique, article 2." },
  eyeinjury: { label: "Blessure à l'œil", itemHint: "Collyre, Compresse oculaire stérile",
   keywords: ["œil","yeux","vision","poussière","produit chimique","éclaboussure","quelque chose dans l'œil","douleur oculaire","œil rouge","larmes","vision floue","ne voit pas bien","acide dans l'œil","corps étranger","grain de sable","objet dans l'œil","œil brûlant","flash de soudage","poussière de chantier","laboratoire œil","œil blessé","coupure à l'œil"],
   urgencyNote: "Agissez dans les prochaines minutes , ne frottez pas l'œil, cela aggrave la situation.",
   intro: "Pour une blessure à l'œil , poussière, produit chimique ou corps étranger :",
   steps: ["Ne frottez PAS l'œil en aucun cas.","Utilisez le collyre (article n°11) pour rincer doucement pendant 10 à 15 minutes.","En cas d'éclaboussure chimique: rincez immédiatement et continuellement pendant au moins 15 minutes.","Couvrez doucement avec une compresse oculaire stérile (article n°12) , n'appuyez pas fort.","Appuyez sur Aide maintenant , toute blessure à l'œil nécessite un professionnel médical."],
   speak: "Pour une blessure à l'œil, ne frottez pas l'œil. Utilisez le collyre, article 11, pour rincer doucement pendant 10 à 15 minutes. En cas d'éclaboussure chimique, rincez immédiatement pendant au moins 15 minutes. Couvrez avec la compresse oculaire stérile, article 12. Appuyez sur Aide maintenant." },
  nosebleed: { label: "Saignement de nez", itemHint: "Pack froid #6, Gaze #3",
   keywords: ["nez","saignement de nez","nez qui saigne","sang du nez","nasal","épistaxis","nez cassé","coup au nez","nez qui ne s arrête pas","sang qui coule du nez","sport nez","après chute nez","chaleur nez","déshydratation nez","poussière nez","altitude nez","saignement du visage"],
   urgencyNote: "Restez calme , la plupart des saignements de nez s'arrêtent en 10 minutes avec la bonne technique.",
   intro: "Pour un saignement de nez :",
   steps: ["Asseyez-vous droit , ne penchez PAS la tête en arrière.","Pincez fermement la partie molle du nez pendant 10 minutes sans relâcher.","Respirez par la bouche en pinçant.","Appliquez un pack froid (article n°6) enveloppé dans un tissu sur l'arête du nez.","Si le saignement ne s'arrête pas après 20 minutes, appuyez sur Aide maintenant."],
   speak: "Pour un saignement de nez, asseyez-vous droit et ne penchez pas la tête en arrière. Pincez fermement la partie molle du nez pendant 10 minutes. Appliquez le pack froid, article 6, sur l'arête du nez. Si cela ne s'arrête pas après 20 minutes, appuyez sur Aide maintenant." }
 },
 rw: {
  bleeding: { label: "Amaraso / igikomere", itemHint: "Inzuzo #9, Gaze #3, Bandage #1, Umuti wica mikorobe #5, Ingorogoro #10",
   keywords: ["amaraso","kuva amaraso","igikomere","umukuranzira","gukomeretse","igikomere gikomeye","inkota","inzara","icyuma","amaraso akomoka","gukandagira","guhona","komeretse mu ntoki","komeretse mu mutwe","amaraso ntahagarara","igisebe","umukomerezwa","inzara y ikigo","accident yo akazi"],
   urgencyNote: "Tangira mu munota umwe cyangwa ibiri , amaraso aroroshye kugenzura hakiri kare.",
   intro: "Ku gikomere kiva amaraso:",
   steps: ["Koresha gaze isukuye (igikoresho #3) , kanda neza ku gikomere.","Komeza ukande iminota 5 udasuzuma.","Igihe bigabanutse, sukura ukoresheje umuti wica mikorobe (igikoresho #5).","Pfundikiza na bandage (igikoresho #1) ihuye n'ingano y'igikomere."],
   speak: "Ku maraso, koresha gaze isukuye, igikoresho 3, ukande neza ku gikomere. Komeza ukande iminota 5. Hanyuma sukura ukoresheje umuti wica mikorobe, igikoresho 5, hanyuma upfundikize na bandage." },
  burn: { label: "Gushya", itemHint: "Amazi akonje, Gaze ntahobera #4, Ikintu gikonje #6, Ingorogoro #10",
   keywords: ["gushya","yashye","umuriro","amazi ashyushye","inkongi","ishyira","umuriro w inkwi","amazi ashyushye","igitoro","umuriro wo gufuma","inkongi y amashanyarazi","umuriro w ikirere","izuba","laboratory","inkumbi","forge"],
   urgencyNote: "Tangira mu munota umwe cyangwa ibiri , gukonjesha vuba bigabanya ibyangiritse.",
   intro: "Ku gushya gato:",
   steps: ["Siga amazi akonje gake (ntabe ay'urubura) ku gace iminota 10.","Ntukoreshe urubura ku mubiri ubwawo.","Pfundikiza buhoro na gaze isukuye ntahobera (igikoresho #4).","Ntukomeshe ibirurumba bizahaguruka."],
   speak: "Ku gushya, siga amazi akonje gake ku gace iminota 10. Ntukoreshe urubura. Pfundikiza buhoro na gaze ntahobera, igikoresho 4." },
  headache: { label: "Umutwe urambye", itemHint: "Umuti w'ibibabaza #7 (niba wemewe)",
   keywords: ["umutwe","kubabara umutwe","migraine","umutwe uribwa","kubabara umutwe cyane","gutakaza amazi","ishywa","izuba","stress","kunanirwa","umutwe uzengurutse","isesemi","inyonga","gutakaza ibingwa","umutwe wangiritse"],
   urgencyNote: "Nta kwihuta , ibi birashobora gutegereza iminota mike nyuma y'ibindi byihutirwa.",
   intro: "Ku mutwe urambye:",
   steps: ["Icara ahantu hatuje hanyuma unywe amazi mbere.","Niba byemewe mu kigo cyawe, umuti w'ibibabaza usanzwe (igikoresho #7) urashobora gukoreshwa nk'uko byanditswe.","Niba bikomeye, biza giturumbuka, cyangwa hari impinduka mu kureba, simbuka iki maze ukande Itangazo ubu."],
   speak: "Ku mutwe urambye, icara, unywe amazi, hanyuma uruhuke. Niba byemewe, umuti w'ibibabaza usanzwe, igikoresho 7, urashobora gukoreshwa nk'uko byanditswe. Niba bikomeye cyangwa biza giturumbuka, kanda itangazo ubu." },
  fainting: { label: "Kuraduka", itemHint: "Nta gikoresho , bisaba umukuru",
   keywords: ["yaraduse","kuraduka","yatakaje ubwenge","yaguye","ntiyumva","ntiyumva","ntiyitabira","yagwiriye hasi","yitaye ubwenge","ubwo amarembo","ibibazo bya shuga","kunanirwa","ubushyuhe","guhinda umushyitsi","kutigobera","gufatwa n ibwoba","gutunda","guhagarika","inyuma"],
   urgencyNote: "Kora ako kanya , genzura niba ahumeka ako kanya, ibi ntibitegereza.",
   intro: "Niba umuntu yaraduse:",
   steps: ["Mutaragure hasi maze uzamure amaguru ye gato.","Kuura ikintu cyose kimwifashe ku ijosi.","Genzura niba ahumeka neza.","Ibi bisaba buri gihe umukuru , kanda Itangazo ubu."],
   speak: "Niba umuntu yaraduse, mutaragure hasi, uzamure amaguru ye gato, hanyuma ukuure ikintu cyose kimwifashe ku ijosi. Ibi bisaba buri gihe umukuru. Kanda itangazo ubu." },
  allergic: { label: "Indwara y'aleriji", itemHint: "Umuti w'aleriji (niba byoroheje)",
   keywords: ["aleriji","kubyimba","uduheri","ijosi","ntiyumva neza","anaphylaxis","gufatwa n inyenzi","gufatwa n uruyuki","insiga","kurumwa n inyamaswa","kurumwa n inzoka","inzoka","uruyuki","kurumwa n uruyuki","ibiribwa bibi","ikiribwa kibi","ubuhumure bw agace","ibibyimba mu maso","ibibyimba mu minwa","ijosi rivuga","guhumeka nabi","ingufu","kuribwa uruhu","gutura ruhu"],
   urgencyNote: "Kora ako kanya , genzura kubyimba cyangwa ingorane zo guhumeka ako kanya.",
   intro: "Ku byagaragaza aleriji:",
   steps: ["Genzura kubyimba mu maso, ku minwa, cyangwa ku muhogo, cyangwa ingorane zo guhumeka.","Niba kimwe muri ibyo kihari, ibi ni ibyihutirwa , kanda Itangazo ako kanya.","Niba byoroheje (gusa uduheri ku ruhu), umuti w'aleriji usanzwe (igikoresho #8) urashobora gukoreshwa nk'uko byanditswe."],
   speak: "Ku byagaragaza aleriji, genzura kubyimba mu maso, ku minwa, cyangwa ku muhogo, cyangwa ingorane zo guhumeka. Niba bihari, kanda itangazo ako kanya. Niba byoroheje, hari gusa uduheri ku ruhu, umuti w'aleriji usanzwe, igikoresho 8, urashobora gukoreshwa nk'uko byanditswe." },
  sprain: { label: "Kuribwa ingingo", itemHint: "Ikintu gikonje, Bandage ielastike",
   keywords: ["kuribwa ingingo","guhindagurika","ikirenge","ingingo yabyimbye","kuribwa ikibuno","kuribwa urutoke","kuribwa ivi","sport","gupiganwa","kwiruka","gufatwa n ubwoba","gukandagira","gutemba","ingingo yavuye ahantu","amagufwa","amagufwa amenetse","ingingo yahindagurikiye","kumeneka","amagufwa amenetse","ingingo yabyimbye nyuma yo gutemba","kumva ikigoryi"],
   urgencyNote: "Gutegereza iminota mike birakwiye , ruhuka ako gace mu gihe utegereje niba bikenewe.",
   intro: "Ku ingingo yaribwe cyangwa yahindaguritse:",
   steps: ["Ruhuza ako gace , hagarika gukoresha ako kanya.","Shyiraho ikintu gikonje (igikoresho #6), gipfundikiye mu kitenge, mu minota 15.","Pfundikiza na bandage ielastike (igikoresho #2) niba kubyimba bikomeza.","Niba udashobora gushingira cyangwa kuyinyeganyeza, kanda Itangazo ubu."],
   speak: "Ku ingingo yaribwe, ruhuza ako gace, ushyireho ikintu gikonje, igikoresho 6, gipfundikiye mu kitenge mu minota 15, hanyuma upfundikize na bandage ielastike, igikoresho 2." },
  eyeinjury: { label: "Ingorane z'ijisho", itemHint: "Umuti w'ijisho, Itambaro ry'ijisho",
   keywords: ["ijisho","amaso","kureba","umukungugu mu jisho","umuti mu jisho","gutemba mu jisho","ijisho riribwa","ijisho ritukura","amarira","kureba nabi","umwotsi mu jisho","umwanda mu jisho","akanyama mu jisho","umuti w ubuhumure mu jisho","urumuri rwinshi","forge mu jisho","umucanga mu jisho"],
   urgencyNote: "Kora mu minota mike , ntukere ijisho, ibyo bibyibushya.",
   intro: "Ku ngorane z'ijisho , umukungugu, umuti cyangwa ikintu cyinjiye mu jisho:",
   steps: ["Ntukere ijisho na rimwe.","Koresha umuti w'ijisho (igikoresho #11) kugira ngo usukure buhoro mu minota 10 kugeza 15.","Niba umuti wa chimique winjiye: sukura ako kanya ukomeze iminota 15 byibuze.","Pfundikiza buhoro ukoresheje itambaro ry'ijisho (igikoresho #12) , ntukande cyane ku jisho.","Kanda Ubufasha ubu , ingorane zose z'amaso zisaba umuganga."],
   speak: "Ku ngorane z'ijisho, ntukere ijisho. Koresha umuti w'ijisho, igikoresho 11, kugira ngo usukure buhoro mu minota 10 kugeza 15. Niba umuti wa chimique winjiye, sukura ako kanya iminota 15 byibuze. Pfundikiza ukoresheje itambaro ry'ijisho, igikoresho 12. Kanda Ubufasha ubu." },
  nosebleed: { label: "Amaraso avuye mu mazuru", itemHint: "Ikintu gikonje, Gaze",
   keywords: ["amazuru","amaraso mu mazuru","amaraso avuye mu mazuru","gukorora amaraso","amazuru avuye","amazuru ntahagarara","gukubita mu mazuru","sport amazuru","gushyuha amazuru","gutakaza amazi amazuru","umukungugu amazuru","après chute amazuru","amaraso y amazuru","gutemba amaraso mu mazuru"],
   urgencyNote: "Komera umutima , amaraso menshi ahagarara mu minota 10 ukoresheje uburyo bwiza.",
   intro: "Ku maraso avuye mu mazuru:",
   steps: ["Icara neza , ntugunde umutwe inyuma.","Kanda igice cyoroheje cy'amazuru neza mu minota 10 utarekura.","Humeka ukoresheje akanwa mu gihe ukanda.","Shyiraho ikintu gikonje (igikoresho #6) gipfundikiye mu kitenge ku mazuru.","Niba amaraso atahagaraye nyuma y'iminota 20, kanda Ubufasha ubu."],
   speak: "Ku maraso avuye mu mazuru, icara neza kandi ntugunde umutwe inyuma. Kanda igice cyoroheje cy'amazuru neza mu minota 10 utarekura. Shyiraho ikintu gikonje, igikoresho 6, ku mazuru. Niba atahagaraye nyuma y'iminota 20, kanda Ubufasha ubu." }
 }
};

// ── TRIAGE DATA ────────────────────────────────────────────────────────
// Every situation has 3 severity levels.
// Each level has: label, desc (short description shown on button),
//  steps (guidance for that level), speak (voice text),
//  autoAction: null | 'faculty' | 'emergency'
// autoAction='emergency' on Level 3 skips guidance and fires emergency immediately.

const TRIAGE = {
 en: {
  question: "How serious is it?",
  levels: { l1: "Minor", l2: "Moderate", l3: "Severe , Emergency" },
  situations: {
   bleeding: {
    question: "How serious is the bleeding?",
    l1: { label: "Minor", desc: "Small cut or scrape, bleeding is slow and minimal", autoAction: null,
     steps: ["Put on gloves (item #9).","Clean gently around the wound with an antiseptic wipe (item #5).","Press a sterile gauze (item #3) firmly on the wound.","Hold for 5 minutes without lifting.","Cover with a bandage (item #1) sized to the wound."],
     speak: "For a minor cut, put on gloves, press sterile gauze firmly for 5 minutes, clean with antiseptic wipe, then cover with a bandage." },
    l2: { label: "Moderate", desc: "Wound is deeper, bleeding won't stop after a few minutes, or significant blood loss", autoAction: "faculty",
     steps: ["Put on gloves (item #9) immediately.","If clothing covers the wound, use scissors (item #10) to cut it away , do not pull clothing over a wound.","Press sterile gauze (item #3) firmly , do not lift to check.","If blood soaks through, add more gauze on top , do NOT remove the first.","Elevate the injured area above the heart if possible.","Sickbay/Med Assistant has been alerted , stay calm and keep pressure on the wound."],
     speak: "For moderate bleeding, put on gloves, press gauze firmly and do not lift it. If blood soaks through, add more on top. Elevate the limb. Sickbay/Med Assistant has been alerted.",
     waitingSteps: ["Keep pressing the gauze firmly , do not lift it to check the wound.", "If blood soaks through, add more gauze on top , do not remove the first layer.", "Elevate the injured arm or leg above the level of the heart.", "Help the person sit or lie down , they should not stand.", "Speak calmly to them , tell them help is coming and they are doing well.", "Keep monitoring , help is already on the way."] },
    l3: { label: "Severe", desc: "Heavy uncontrolled bleeding, scalp wound, deep gash, or possible artery involved", autoAction: "emergency",
     steps: ["If clothing covers the wound, use scissors (item #10) to cut it away immediately , do not pull over the wound.","Press HARD on the wound with anything available , cloth, gauze, your hands.","Do NOT remove the material. Add more on top if soaking through.","Keep firm, continuous pressure , do not stop.","Emergency services are being contacted now.","Stay with the person. Talk to them calmly. Do not move them unless they are in danger."],
     speak: "Severe bleeding. Press hard on the wound and do not remove the material. Add more on top if needed. Keep firm pressure. Emergency services are being contacted now.",
     waitingSteps: ["Keep pressing HARD , do not release pressure for any reason until help arrives.", "If blood soaks through, add more cloth or gauze ON TOP , never remove what is already on the wound.", "Elevate the injured limb above the level of the heart if possible.", "Keep the person lying down , do not let them stand or walk.", "Talk to them calmly , keep them conscious and reassured.", "Do not give water or food , they may need surgery."],
     waitingSpeak: "Emergency has been contacted. While waiting: keep pressing hard on the wound. Do not remove the cloth. Add more on top if needed. Elevate the limb. Keep the person lying down. Talk to them calmly and do not give them anything to eat or drink." }
   },
   burn: {
    question: "How serious is the burn?",
    l1: { label: "Minor", desc: "Small area, skin is red, no blisters", autoAction: null,
     steps: ["Run cool water over the burn for at least 10 minutes.","Do NOT use ice, butter, or toothpaste.","Cover loosely with non-stick sterile gauze (item #4).","Do not pop any blisters that form.","If the burn is small and the person is fully alert, pain relief tablet (item #7) may be given if approved at your institution , do NOT give for large or severe burns."],
     speak: "For a minor burn, run cool water for at least 10 minutes. Do not use ice. Cover loosely with non-stick gauze. Do not pop blisters." },
    l2: { label: "Moderate", desc: "Blistering, larger area affected, or burn on face, hands, or joints", autoAction: "faculty",
     steps: ["Run cool water over the burn for at least 15 minutes.","If clothing is NOT stuck to the burn, use scissors (item #10) to cut it away carefully , never pull it over the burn.","Do NOT remove clothing stuck to the burn.","Cover loosely with non-stick sterile gauze (item #4) , do not wrap tightly.","Sickbay/Med Assistant has been alerted , this needs professional medical review.","Keep the person calm and still."],
     speak: "For a moderate burn, run cool water for 15 minutes. Do not remove stuck clothing. Cover loosely with non-stick gauze. Sickbay/Med Assistant has been alerted.",
     waitingSteps: ["Keep running cool water over the burn , set a timer for 15 minutes and do not stop early.", "Do not remove any clothing that is stuck to the burn , leave it for medical staff.", "Do not apply anything to the burn , no ice, no butter, no cream.", "Once rinsed, cover loosely with non-stick sterile gauze (item 4) , do not wrap tightly.", "Reassure the person calmly , tell them help is on the way.", "Keep monitoring , help is already on the way."] },
    l3: { label: "Severe", desc: "Large area, charred or white skin, chemical or electrical burn, or burn near the face or airway", autoAction: "emergency",
     steps: ["Run cool water over the burn for at least 20 minutes , this applies to ALL burns including large and severe ones. Do NOT use ice or very cold water.","Do NOT touch the burned area directly.","Keep the person still and as calm as possible.","If chemical burn on skin: use scissors (item #10) to carefully cut away clothing that is not stuck , never pull , then rinse immediately with water.","Emergency services are being contacted now."],
     speak: "Severe burn. Do not touch the burned area. Keep the person still. Emergency services are being contacted now.",
     waitingSteps: ["Do NOT touch, rub, or cover the burned area with anything sticky or fluffy.", "Do NOT apply ice, butter, toothpaste, or any home remedy.", "Do NOT remove clothing stuck to the burn , leave it for medical staff.", "Keep the person still and as calm as possible.", "Do NOT give food or water by mouth , the person may need surgery under anaesthetic.", "If there is smoke or fumes in the area, move the person to fresh air if it is safe to do so."],
     waitingSpeak: "Emergency has been contacted. While waiting: do not touch the burned area. Do not apply anything to it. Do not remove stuck clothing. Keep the person still. Allow small sips of water if they are conscious." }
   },
   headache: {
    question: "How serious is the headache?",
    l1: { label: "Minor", desc: "Mild headache, person is alert and functional", autoAction: null,
     steps: ["Move to a quiet, cool, dark area.","Drink water slowly , dehydration is the most common cause.","If approved, take pain relief tablet (item #7) as labeled.","Rest for 15, 20 minutes.","If headache worsens or is accompanied by nausea, press Help."],
     speak: "For a mild headache, move to a quiet cool area, drink water, and rest. Take a pain relief tablet if approved. If it worsens, press Help." },
    l2: { label: "Moderate", desc: "Persistent, getting worse, or accompanied by nausea, dizziness, or sensitivity to light", autoAction: "faculty",
     steps: ["Help the person sit or lie down in a quiet, cool area.","Loosen any tight clothing around the neck or head.","Offer water if they are not nauseous.","Sickbay/Med Assistant has been alerted , monitor the person until help arrives.","Do not leave them alone."],
     speak: "For a moderate headache with dizziness or nausea, help the person rest in a cool area, loosen tight clothing, and offer water. Sickbay/Med Assistant has been alerted.",
     waitingSteps: ["Help the person lie down in a quiet, cool, dimly lit area.", "Loosen anything tight around the neck, collar, or chest.", "Offer small sips of water , do not force them to drink.", "Do not give any medication unless already prescribed for this person.", "Stay with them and talk quietly , reassure them that help is on the way.", "Keep monitoring , help is already on the way."] },
    l3: { label: "Severe", desc: "Sudden, severe , described as the worst headache of their life, or with confusion, vision changes, or weakness", autoAction: "emergency",
     steps: ["Keep the person still , do not move them unnecessarily.","Do not give any medication.","If they lose consciousness, place them in the recovery position on their side.","Emergency services are being contacted now.","Stay with them and talk calmly."],
     speak: "Severe sudden headache. Keep the person still, do not give medication. Emergency services are being contacted now.",
     waitingSteps: ["Keep the person completely still , do not move them unless they are in immediate danger.", "Do NOT give any pain medication , it can mask symptoms that doctors need to see.", "Dim the lights and reduce noise around them if possible , light and sound worsen this type of headache.", "If they vomit, turn them gently on their side to prevent choking.", "If they become confused or lose consciousness, check their breathing and place them in the recovery position.", "Stay with them and note the time the headache started , tell this to medical staff."],
     waitingSpeak: "Emergency has been contacted. While waiting: keep the person still. Do not give medication. Dim the lights and reduce noise. If they vomit, turn them gently on their side. Stay with them and note when it started." }
   },
   fainting: {
    question: "What is the person's current state?",
    l1: { label: "Recovered quickly", desc: "Person regained consciousness within a minute and feels okay", autoAction: null,
     steps: ["Lay the person flat on their back.","Raise their legs about 30cm (one foot) above heart level.","Loosen anything tight around the neck or chest.","Give small sips of water once fully alert.","Monitor for 15 minutes before allowing them to stand."],
     speak: "Person has recovered. Lay them flat, raise their legs slightly, loosen tight clothing, and give small sips of water once fully alert." },
    l2: { label: "Slow to recover", desc: "Confused, groggy, slow to respond, or fainted with no obvious cause", autoAction: "faculty",
     steps: ["Lay the person flat , do not sit them up yet.","Loosen clothing around the neck and chest.","Check they are breathing normally.","Sickbay/Med Assistant has been alerted , stay with the person until help arrives.","If they stop breathing or become unresponsive, press Emergency immediately."],
     speak: "Person is slow to recover. Keep them flat, loosen tight clothing, and check they are breathing. Sickbay/Med Assistant has been alerted.",
     waitingSteps: ["Keep the person lying flat , do not sit them up yet.", "Loosen clothing around the neck, chest, and waist.", "Check they are breathing every 30 seconds , look, listen, feel.", "If they become fully alert, offer small sips of water and help them sit up slowly.", "Stay with them and speak calmly , tell them where they are and that help is coming.", "If they stop breathing and you are trained, begin CPR , help is already coming."] },
    l3: { label: "Unconscious / not responding", desc: "Person is not conscious, not responding, or not breathing normally", autoAction: "emergency",
     steps: ["Check for breathing , look, listen, feel for breath for 10 seconds.","If not breathing: begin CPR if you are trained.","If breathing: place in recovery position , gently roll onto their side, check the mouth for vomit or obstruction and clear if visible, then tilt the head back slightly to keep the airway open.","Do not give anything by mouth.","Emergency services are being contacted now. Stay with them."],
     speak: "Person is unconscious. Check breathing. If trained, begin CPR. If breathing, place on their side in recovery position. Emergency services are being contacted now.",
     waitingSteps: ["Check breathing every 30 seconds , look, listen, feel.", "If breathing: keep them in the recovery position (on their side, head tilted slightly back) , this prevents choking if they vomit.", "If not breathing and you are trained: begin CPR , 30 chest compressions, 2 rescue breaths, repeat.", "Do NOT give anything by mouth , not water, not food, not medication.", "Do NOT leave them alone , someone must stay with them at all times.", "Loosen tight clothing around neck, chest, and waist.", "Note if they had any seizure activity , tell this to medical staff when they arrive."],
     waitingSpeak: "Emergency has been contacted. While waiting: keep checking breathing. If breathing, keep on their side. If not breathing and trained, begin CPR. Do not give anything by mouth. Do not leave them alone." }
   },
   allergic: {
    question: "How severe is the allergic reaction?",
    l1: { label: "Mild", desc: "Skin rash, hives, or mild itching only , no swelling, no breathing difficulty", autoAction: null,
     steps: ["Remove the person from whatever triggered the reaction if possible.","Use antihistamine tablet (item #8) as labeled , only if approved at your institution.","Monitor for 30 minutes for any worsening.","If any swelling appears, press Help immediately.","Keep the person calm and seated."],
     speak: "For a mild allergic reaction with rash only, give an antihistamine if approved and monitor for 30 minutes. If any swelling appears, press Help immediately." },
    l2: { label: "Moderate", desc: "Swelling starting, widespread itching, person is anxious or distressed", autoAction: "faculty",
     steps: ["Keep the person seated and calm.","If antihistamine approved, give it now (item #8).","Do NOT give anything else by mouth.","Sickbay/Med Assistant has been alerted , watch for any swelling of the face, lips, or throat.","If breathing becomes difficult, press Emergency immediately."],
     speak: "Moderate allergic reaction. Give antihistamine if approved. Sickbay/Med Assistant has been alerted. Watch for throat swelling , if breathing changes, press Emergency now.",
     waitingSteps: ["Give antihistamine tablet (item 8) if approved at your institution , follow the dosage on the label.", "Keep the person seated and calm , do not let them walk around.", "Watch their face, lips, and throat closely for any swelling.", "Watch for any changes in breathing , listen for wheezing or a high-pitched sound.", "Reassure them calmly and tell them help is coming.", "Help is already on the way , keep watching their breathing closely."] },
    l3: { label: "Severe , Anaphylaxis", desc: "Swelling of face, lips, or throat , difficulty breathing, wheezing, or collapsing", autoAction: "emergency",
     steps: ["Emergency services are being contacted now , this is anaphylaxis.","If the person has an EpiPen, help them use it immediately on the outer thigh.","If conscious and breathing is fine: lay flat with legs raised above heart level. If breathing is difficult: keep sitting upright. If unconscious or vomiting: do NOT lay flat , place gently on their side in the recovery position.","Do NOT give anything by mouth.","If they stop breathing, begin CPR if trained."],
     speak: "Anaphylaxis. Emergency services are being contacted now. Help use EpiPen if available. Lay them flat with legs raised unless breathing is difficult.",
     waitingSteps: ["If person has an EpiPen: help them inject it into the outer thigh , through clothing is fine.", "If conscious and breathing fine: lay flat with legs elevated above heart level. If breathing is difficult: keep sitting upright. If unconscious or vomiting: do NOT lay flat , place gently on their side in the recovery position.", "Do NOT give antihistamines , they are too slow for anaphylaxis.", "Do NOT give anything by mouth.", "A second EpiPen dose may be given after 5, 15 minutes if symptoms return or do not improve.", "Stay with them , anaphylaxis can worsen rapidly even after initial improvement."],
     waitingSpeak: "Emergency has been contacted. If EpiPen available, use it now on the outer thigh. If breathing is difficult, keep them sitting up. Otherwise lay flat with legs raised. Do not give anything by mouth. Stay with them." }
   },
   sprain: {
    question: "How severe is the injury?",
    l1: { label: "Minor", desc: "Mild pain and swelling, person can still bear some weight", autoAction: null,
     steps: ["Rest the injured area immediately , stop using it.","Apply cold pack (item #6), wrapped in cloth, for 15 minutes.","Wrap with elastic bandage (item #2) to support swelling , not too tight.","Elevate the area above heart level if possible.","If pain increases or they cannot bear weight, press Help."],
     speak: "For a minor sprain, rest the area, apply the cold pack wrapped in cloth for 15 minutes, wrap with elastic bandage, and elevate if possible." },
    l2: { label: "Moderate", desc: "Significant swelling, bruising, or person cannot bear weight at all", autoAction: "faculty",
     steps: ["Keep the person completely still , do not attempt to walk.","Apply cold pack (item #6), wrapped in cloth, for 15 minutes.","Do NOT try to straighten or manipulate the joint.","Sickbay/Med Assistant has been alerted , the person may need an X-ray to rule out a fracture.","Keep them calm and elevated."],
     speak: "Moderate sprain or possible fracture. Keep the person still. Apply cold pack. Sickbay/Med Assistant has been alerted , they may need an X-ray.",
     waitingSteps: ["Keep the person completely still , do not encourage them to walk or move the injured area.", "Apply the cold pack (item 6) wrapped in cloth for 15 minutes , do not apply ice directly to skin.", "Do not try to straighten or adjust the joint or limb in any way.", "Elevate the injured area gently above heart level if it causes no extra pain.", "Reassure the person calmly , tell them you are waiting for help and they are safe.", "Keep monitoring and reassure them , help is already coming."] },
    l3: { label: "Severe", desc: "Bone visibly deformed, joint completely out of place, or severe pain with inability to move", autoAction: "emergency",
     steps: ["Do NOT attempt to move or realign the joint or bone.","Immobilize the area in the position you found it.","Apply cold pack (item #6) gently nearby , not directly on a deformity.","Emergency services are being contacted now.","Keep the person still and calm until help arrives."],
     speak: "Possible fracture or dislocation. Do not move the joint. Immobilize in the position found. Emergency services are being contacted now.",
     waitingSteps: ["Do NOT attempt to straighten, realign, or pop the bone or joint back into place , this is for medical professionals only.", "Immobilize the area exactly as you found it , use a rolled towel, clothing, or whatever is available to support it without moving it.", "Do NOT remove shoes or clothing from the injured area , swelling may make this impossible later and medical staff need to do this carefully.", "Apply cold pack (item #6) NEAR the injury, not directly on a visible deformity.", "Keep the person still and lying down if possible.", "Do NOT give food or water , they may need surgery under anaesthetic.", "Reassure them and keep them warm , shock is a real risk with fractures."],
     waitingSpeak: "Emergency has been contacted. While waiting: do not move the bone or joint. Support it exactly as found. Apply cold pack nearby. Keep the person still. Do not give food or water. Keep them warm and reassure them." }
   },
   eyeinjury: {
    question: "What kind of eye injury is this?",
    l1: { label: "Minor", desc: "Dust, small particle, or mild irritation only", autoAction: null,
     steps: ["Do NOT rub the eye.","Use eye wash solution (item #11) to rinse gently for 10 minutes.","Hold the eye gently open and let the water flow across it from the inner corner outward , do NOT blink forcefully or squeeze the eyelid, as this can scratch the cornea.","Cover with sterile eye pad (item #12) if irritation continues.","If particle is still visible or discomfort continues, press Help."],
     speak: "For minor eye irritation, do not rub the eye. Rinse gently with eye wash solution for 10 minutes. Cover with the sterile eye pad if irritation continues." },
    l2: { label: "Moderate", desc: "Scratching sensation after rinsing, persistent redness, or small visible object on eye surface", autoAction: "faculty",
     steps: ["Do NOT attempt to remove anything from the eye surface.","Continue rinsing with eye wash solution (item #11) for 15 minutes.","Cover gently with sterile eye pad (item #12) , do not press.","Sickbay/Med Assistant has been alerted , this needs professional eye examination.","Keep the person from rubbing or touching the eye."],
     speak: "Moderate eye injury. Continue rinsing with eye wash for 15 minutes. Cover with sterile eye pad. Sickbay/Med Assistant has been alerted.",
     waitingSteps: ["Continue rinsing with eye wash solution (item 11) , do not stop before 15 minutes are complete.", "Tell the person not to rub the eye under any circumstances.", "After rinsing, cover the eye gently with a sterile eye pad (item 12) , do not press hard.", "Ask the person to keep both eyes closed and still , moving one eye moves the other.", "Reassure them calmly , tell them the eye is being protected and help is coming.", "Keep the eye covered and still , help is already on the way."] },
    l3: { label: "Severe", desc: "Chemical or acid splash, embedded object, punctured eye, or sudden vision change", autoAction: "emergency",
     steps: ["If chemical splash: rinse with eye wash (item #11) IMMEDIATELY and continuously for 15 minutes , do not stop.","Do NOT remove any embedded object from the eye.","Cover both eyes gently with sterile eye pads (item #12) to reduce movement.","Emergency services are being contacted now.","Keep the person calm and still , vision is at serious risk."],
     speak: "Severe eye injury. Rinse immediately and continuously for 15 minutes if chemical. Do not remove embedded objects. Cover both eyes. Emergency services are being contacted now.",
     waitingSteps: ["If chemical splash: continue rinsing with eye wash (item #11) the entire time until help arrives , do not stop.", "Do NOT attempt to remove any object embedded in or through the eye.", "Cover BOTH eyes gently with sterile eye pads (item #12) , covering both reduces movement of the injured eye.", "Tell the person not to move their eyes from side to side.", "Do NOT rub the eye under any circumstances.", "Keep the person calm and still , sudden movements can worsen eye injuries.", "Tell medical staff exactly what substance entered the eye and when."],
     waitingSpeak: "Emergency has been contacted. If chemical, keep rinsing continuously. Do not remove any embedded object. Cover both eyes. Tell the person not to move their eyes. Keep them calm and still." }
   },
   nosebleed: {
    question: "How serious is the nosebleed?",
    l1: { label: "Minor", desc: "Slow, manageable bleeding , no injury or impact involved", autoAction: null,
     steps: ["Sit upright , do NOT tilt the head backward.","Pinch the soft part of the nose firmly for 10 minutes without releasing.","Breathe through the mouth while pinching.","Apply cold pack (item #6) wrapped in cloth to the bridge of the nose.","After 10 minutes, release slowly. If still bleeding, pinch for another 10 minutes."],
     speak: "For a minor nosebleed, sit upright, pinch the soft part of the nose for 10 minutes without releasing, and apply the cold pack to the bridge of the nose." },
    l2: { label: "Moderate", desc: "Bleeding not stopping after 20 minutes, or nosebleed after a head impact", autoAction: "faculty",
     steps: ["Continue pinching the nose , do not stop pressure.","Keep the person upright and calm.","Do NOT pack the nose with anything.","Sickbay/Med Assistant has been alerted , if this followed a head impact, a concussion must be ruled out.","If the person feels faint, lay them flat while keeping head slightly elevated."],
     speak: "Moderate nosebleed. Continue applying pressure. Sickbay/Med Assistant has been alerted. If this followed a head impact, a concussion check is needed.",
     waitingSteps: ["Keep the person sitting upright , do not tilt the head back.", "Continue pinching the soft part of the nose firmly , set a timer and do not release for 10 minutes.", "Apply the cold pack (item 6) to the bridge of the nose to help slow the bleeding.", "If this happened after a head impact, watch for confusion, dizziness, or unequal pupils , these are signs of concussion.", "Reassure the person calmly , tell them you are keeping pressure on and help is on the way.", "Keep applying pressure , help is already on the way."] },
    l3: { label: "Severe", desc: "Very heavy bleeding, blood flowing down the throat, or person is faint or losing consciousness", autoAction: "emergency",
     steps: ["Keep the person sitting upright if conscious , blood flowing down the throat can cause choking.","If unconscious, place on their side.","Do NOT tilt the head back.","Emergency services are being contacted now.","Stay with the person and keep them calm."],
     speak: "Severe nosebleed. Keep the person upright. Do not tilt the head back. Emergency services are being contacted now.",
     waitingSteps: ["Keep the person sitting upright at all times , blood flowing down the throat can cause choking or vomiting.", "Continue pinching the nose if the person is conscious and cooperative.", "If blood is flowing down the throat and they feel like gagging, let them spit it out , do not swallow it.", "Do NOT pack the nostrils with tissue or cotton , this can cause more damage when removed.", "If person becomes faint or loses consciousness, place them gently on their side.", "Keep them calm , anxiety increases blood pressure which worsens the bleeding.", "Note the time the bleeding started and tell medical staff."],
     waitingSpeak: "Emergency has been contacted. Keep the person upright. Continue pinching if possible. If blood runs down the throat, let them spit it out. Do not pack the nostrils. If they faint, place on their side." }
   }
  }
 }
};

// French and Kinyarwanda inherit EN guidance but translate UI labels and question text
TRIAGE.fr = {
 question: "Quelle est la gravité ?",
 levels: { l1: "Léger", l2: "Modéré", l3: "Grave , Urgence" },
 situations: Object.fromEntries(Object.entries(TRIAGE.en.situations).map(([key, s]) => [key, {
  question: TRIAGE.en.situations[key].question,
  l1: { ...s.l1 }, l2: { ...s.l2 }, l3: { ...s.l3 }
 }]))
};
TRIAGE.rw = {
 question: "Bite bikaze bingana iki ?",
 levels: { l1: "Byoroheje", l2: "Bigifite ingaruka", l3: "Bikaze , Ubutabazi" },
 situations: Object.fromEntries(Object.entries(TRIAGE.en.situations).map(([key, s]) => [key, {
  question: TRIAGE.en.situations[key].question,
  l1: { ...s.l1 }, l2: { ...s.l2 }, l3: { ...s.l3 }
 }]))
};

// Override question text in French
TRIAGE.fr.situations.bleeding.question = "Quelle est la gravité du saignement ?";
TRIAGE.fr.situations.burn.question = "Quelle est la gravité de la brûlure ?";
TRIAGE.fr.situations.headache.question = "Quelle est la gravité du mal de tête ?";
TRIAGE.fr.situations.fainting.question = "Quel est l'état actuel de la personne ?";
TRIAGE.fr.situations.allergic.question = "Quelle est la gravité de la réaction allergique ?";
TRIAGE.fr.situations.sprain.question = "Quelle est la gravité de la blessure ?";
TRIAGE.fr.situations.eyeinjury.question = "Quel type de blessure à l'œil ?";
TRIAGE.fr.situations.nosebleed.question = "Quelle est la gravité du saignement de nez ?";

// Override question text in Kinyarwanda
TRIAGE.rw.situations.bleeding.question = "Amaraso avuye bingana iki ?";
TRIAGE.rw.situations.burn.question = "Inkongi ikaze bingana iki ?";
TRIAGE.rw.situations.headache.question = "Umutwe uribwa bingana iki ?";
TRIAGE.rw.situations.fainting.question = "Umuntu ari mu bihe ?";
TRIAGE.rw.situations.allergic.question = "Indwara y'aleriji ikaze bingana iki ?";
TRIAGE.rw.situations.sprain.question = "Ibikomere bikaze bingana iki ?";
TRIAGE.rw.situations.eyeinjury.question = "Ni ingorane iyihe y'ijisho ?";
TRIAGE.rw.situations.nosebleed.question = "Amaraso y'amazuru akaze bingana iki ?";

// ── ANIMATION DATA ─────────────────────────────────────────────────────
// Each situation has an array of SVG frames , one per guidance step.
// These simulate what the physical 2.8-inch TFT screen would display.
// Style: simple white line drawings on dark background, IKEA-style clarity.

const STEP_ANIMATIONS = {
 bleeding: {
  l1: [
   { label: 'Put on gloves', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 1 , GLOVES FIRST</text>
 <ellipse cx="70" cy="88" rx="22" ry="30" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="50" y="58" width="8" height="22" rx="4" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="60" y="53" width="8" height="24" rx="4" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="70" y="51" width="8" height="24" rx="4" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="80" y="55" width="8" height="22" rx="4" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="135" cy="85" rx="28" ry="36" fill="none" stroke="#5DCAA5" stroke-width="2.5" stroke-dasharray="4,3"/>
 <text x="135" y="90" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Pull on</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 9 , Gloves</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Protect yourself first</text>` },
   { label: 'Press gauze on wound', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 2 , PRESS FIRMLY</text>
 <ellipse cx="100" cy="82" rx="35" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="100" cy="82" rx="9" ry="5" fill="#990011" opacity="0.7"/>
 <rect x="74" y="65" width="52" height="34" rx="4" fill="#F5F5F0" opacity="0.9"/>
 <line x1="84" y1="73" x2="116" y2="92" stroke="#DDDDCC" stroke-width="1"/>
 <line x1="84" y1="83" x2="116" y2="83" stroke="#DDDDCC" stroke-width="1"/>
 <line x1="80" y1="45" x2="80" y2="60" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="77,60 83,60 80,67" fill="#5DCAA5"/>
 <line x1="120" y1="45" x2="120" y2="60" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="117,60 123,60 120,67" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Press HARD , 5 minutes</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Item 3 , sterile gauze</text>` },
   { label: 'Clean with antiseptic wipe', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 3 , CLEAN</text>
 <ellipse cx="80" cy="85" rx="28" ry="16" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="105" y="55" width="36" height="50" rx="6" fill="#5DCAA5" opacity="0.3" stroke="#5DCAA5" stroke-width="2"/>
 <text x="123" y="78" text-anchor="middle" fill="#5DCAA5" font-size="7" font-family="Arial">Anti</text>
 <text x="123" y="88" text-anchor="middle" fill="#5DCAA5" font-size="7" font-family="Arial">septic</text>
 <line x1="100" y1="85" x2="72" y2="85" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="72,82 80,85 72,88" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Wipe gently outward</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Item 5 , antiseptic wipe</text>` },
   { label: 'Cover with bandage', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 4 , BANDAGE</text>
 <ellipse cx="100" cy="80" rx="35" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="68" y="66" width="64" height="28" rx="8" fill="#F5C4B3" opacity="0.8" stroke="#E8997B" stroke-width="1.5"/>
 <line x1="75" y1="80" x2="125" y2="80" stroke="#E8997B" stroke-width="1"/>
 <text x="100" y="84" text-anchor="middle" fill="#4A1B0C" font-size="8" font-family="Arial">Bandage</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 1 , size to wound</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Cover completely and press edges</text>` },
   { label: 'Apply bandage', svg: `<ellipse cx="100" cy="80" rx="35" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="68" y="66" width="64" height="28" rx="8" fill="#F5C4B3" opacity="0.8" stroke="#E8997B" stroke-width="1.5"/><text x="100" y="84" text-anchor="middle" fill="#4A1B0C" font-size="8" font-family="Arial">Bandage</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 1 , press edges down</text>` },
  ],
  l2: [
   { label: 'Put gloves on immediately', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">MODERATE , GLOVES NOW</text>
 <ellipse cx="100" cy="80" rx="36" ry="42" fill="none" stroke="#5DCAA5" stroke-width="3"/>
 <text x="100" y="75" text-anchor="middle" fill="#5DCAA5" font-size="22" font-family="Arial"></text>
 <text x="100" y="95" text-anchor="middle" fill="#5DCAA5" font-size="11" font-weight="bold" font-family="Arial">FIRST</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 9 , gloves on NOW</text>` },
   { label: 'Cut clothing from wound with scissors', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="28" font-family="Arial"></text><path d="M 60 75 L 140 75" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/><text x="100" y="100" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">CUT , do not pull over wound</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 10 , scissors</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Cut clothing away from wound</text>` },
   { label: 'Press gauze , do not lift', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">DO NOT LIFT GAUZE</text>
 <ellipse cx="80" cy="82" rx="32" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="53" y="68" width="54" height="28" rx="4" fill="#F5F5F0" opacity="0.9"/>
 <line x1="65" y1="40" x2="65" y2="60" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="62,60 68,60 65,68" fill="#5DCAA5"/>
 <line x1="95" y1="40" x2="95" y2="60" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="92,60 98,60 95,68" fill="#5DCAA5"/>
 <line x1="126" y1="58" x2="170" y2="102" stroke="#990011" stroke-width="3"/>
 <line x1="170" y1="58" x2="126" y2="102" stroke="#990011" stroke-width="3"/>
 <text x="148" y="108" text-anchor="middle" fill="#990011" font-size="9" font-family="Arial">No lifting</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Press firmly , no peeking</text>` },
   { label: 'Add more if soaking through', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">ADD ON TOP</text>
 <rect x="68" y="72" width="50" height="32" rx="4" fill="#8B2020" opacity="0.7"/>
 <text x="93" y="92" text-anchor="middle" fill="#FFB0B0" font-size="8" font-family="Arial">soaked</text>
 <rect x="62" y="62" width="62" height="32" rx="4" fill="#F5F5F0" opacity="0.95" stroke="#5DCAA5" stroke-width="2"/>
 <line x1="45" y1="55" x2="45" y2="71" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="42,71 48,71 45,63" fill="#5DCAA5"/>
 <text x="45" y="52" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">Add</text>
 <line x1="142" y1="66" x2="174" y2="98" stroke="#990011" stroke-width="3"/>
 <line x1="174" y1="66" x2="142" y2="98" stroke="#990011" stroke-width="3"/>
 <text x="158" y="105" text-anchor="middle" fill="#990011" font-size="8" font-family="Arial">Don't remove</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Stack gauze , never remove</text>` },
   { label: 'Elevate above heart level', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">ELEVATE LIMB</text>
 <ellipse cx="53" cy="90" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="69" y="83" width="90" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="161" cy="90" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="142" y1="90" x2="185" y2="58" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="185" cy="56" rx="13" ry="9" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="185" y1="88" x2="185" y2="73" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="182,73 188,73 185,65" fill="#5DCAA5"/>
 <text x="60" y="78" text-anchor="middle" fill="#990011" font-size="12" font-family="Arial"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Above heart level</text>` },
   { label: 'Keep lying down', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">STAY DOWN</text>
 <ellipse cx="43" cy="80" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="73" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="80" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="10" y1="98" x2="190" y2="98" stroke="#555552" stroke-width="1.5"/>
 <text x="100" y="118" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold" font-family="Arial">DO NOT STAND</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep flat , help is coming</text>` },
   { label: 'Talk calmly , help is coming', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">STAY WITH THEM</text>
 <ellipse cx="65" cy="60" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="51" y="76" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="118" cy="90" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="134" y="83" width="40" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="176" cy="90" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="100" cy="55" rx="22" ry="13" fill="#5DCAA5" opacity="0.2" stroke="#5DCAA5" stroke-width="1.5"/>
 <text x="100" y="52" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">Help is</text>
 <text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">coming</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Talk , keep them conscious</text>` },
  ],
  l3: [
   { label: 'Press HARD with anything available', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">SEVERE , PRESS HARD</text>
 <ellipse cx="100" cy="80" rx="38" ry="22" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="100" cy="80" rx="15" ry="9" fill="#990011" opacity="0.8"/>
 <path d="M 60 50 Q 100 38 140 50 L 145 70 Q 100 60 55 70 Z" fill="#5DCAA5" opacity="0.6"/>
 <line x1="75" y1="38" x2="75" y2="52" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="71,52 79,52 75,60" fill="#5DCAA5"/>
 <line x1="125" y1="38" x2="125" y2="52" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="121,52 129,52 125,60" fill="#5DCAA5"/>
 <text x="100" y="115" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold" font-family="Arial">PRESS AS HARD AS YOU CAN</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Emergency contacted , keep pressing</text>` },
   { label: 'Cut clothing from wound with scissors', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="28" font-family="Arial"></text><path d="M 60 75 L 140 75" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/><text x="100" y="100" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">CUT , do not pull over wound</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 10 , scissors</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Cut clothing away from wound</text>` },
   { label: 'Add more , never remove', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">NEVER REMOVE</text>
 <rect x="70" y="68" width="52" height="32" rx="4" fill="#8B2020" opacity="0.8"/>
 <rect x="64" y="58" width="64" height="32" rx="4" fill="#F5F5F0" opacity="0.95" stroke="#5DCAA5" stroke-width="2.5"/>
 <line x1="42" y1="48" x2="42" y2="68" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="39,68 45,68 42,60" fill="#5DCAA5"/>
 <text x="30" y="45" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">Add more</text>
 <text x="30" y="55" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">on top</text>
 <line x1="142" y1="58" x2="182" y2="98" stroke="#990011" stroke-width="3"/>
 <line x1="182" y1="58" x2="142" y2="98" stroke="#990011" stroke-width="3"/>
 <text x="162" y="105" text-anchor="middle" fill="#990011" font-size="9" font-family="Arial">NEVER</text>
 <text x="162" y="116" text-anchor="middle" fill="#990011" font-size="9" font-family="Arial">REMOVE</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Stack layers , no gaps</text>` },
   { label: 'Elevate high', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">ELEVATE HIGH</text>
 <ellipse cx="53" cy="90" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="69" y="83" width="90" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="161" cy="90" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="142" y1="90" x2="190" y2="50" stroke="#E0D4C0" stroke-width="9" stroke-linecap="round"/>
 <line x1="190" y1="90" x2="190" y2="63" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="187,63 193,63 190,55" fill="#5DCAA5"/>
 <text x="100" y="118" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold" font-family="Arial">AS HIGH AS POSSIBLE</text>` },
   { label: 'Do not let them stand', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">KEEP DOWN</text>
 <ellipse cx="43" cy="78" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="71" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="78" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="10" y1="98" x2="190" y2="98" stroke="#555552" stroke-width="1.5"/>
 <text x="100" y="118" text-anchor="middle" fill="#990011" font-size="12" font-weight="bold" font-family="Arial">DO NOT STAND</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Clinic is on the way</text>` },
   { label: 'No food or water', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">NO FOOD OR WATER</text>
 <text x="60" y="75" text-anchor="middle" fill="#888780" font-size="30" font-family="Arial"></text>
 <line x1="32" y1="42" x2="88" y2="98" stroke="#990011" stroke-width="3"/>
 <line x1="88" y1="42" x2="32" y2="98" stroke="#990011" stroke-width="3"/>
 <text x="140" y="75" text-anchor="middle" fill="#888780" font-size="30" font-family="Arial"></text>
 <line x1="112" y1="42" x2="168" y2="98" stroke="#990011" stroke-width="3"/>
 <line x1="168" y1="42" x2="112" y2="98" stroke="#990011" stroke-width="3"/>
 <text x="100" y="115" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold" font-family="Arial">NOTHING BY MOUTH</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">May need surgery , clinic coming</text>` },
   { label: 'Talk calmly , keep conscious', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">KEEP THEM AWAKE</text>
 <ellipse cx="118" cy="90" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="134" y="83" width="40" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="176" cy="90" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="55" cy="60" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="41" y="76" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="96" cy="55" rx="24" ry="13" fill="#5DCAA5" opacity="0.2" stroke="#5DCAA5" stroke-width="1.5"/>
 <text x="96" y="52" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">Stay with</text>
 <text x="96" y="62" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">me...</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep them talking and awake</text>` },
  ],
  waiting: [
   { label: 'Press continuously , no release', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">DO NOT STOP PRESSING</text>
 <text x="100" y="55" text-anchor="middle" fill="#5DCAA5" font-size="36" font-family="Arial"></text>
 <text x="100" y="90" text-anchor="middle" fill="#FFEAA0" font-size="11" font-weight="bold" font-family="Arial">CONTINUOUS PRESSURE</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not release for any reason</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Clinic is on the way</text>` },
   { label: 'Add more , never remove', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">KEEP ADDING</text>
 <rect x="70" y="65" width="52" height="30" rx="4" fill="#8B2020" opacity="0.7"/>
 <rect x="64" y="55" width="64" height="30" rx="4" fill="#F5F5F0" opacity="0.95" stroke="#FFEAA0" stroke-width="2"/>
 <line x1="42" y1="45" x2="42" y2="64" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="39,64 45,64 42,56" fill="#5DCAA5"/>
 <text x="30" y="42" text-anchor="middle" fill="#FFEAA0" font-size="8" font-family="Arial">Add here</text>
 <line x1="142" y1="57" x2="178" y2="93" stroke="#990011" stroke-width="3"/>
 <line x1="178" y1="57" x2="142" y2="93" stroke="#990011" stroke-width="3"/>
 <text x="160" y="100" text-anchor="middle" fill="#990011" font-size="8" font-family="Arial">Don't pull</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Stack , do not remove</text>` },
   { label: 'Elevate limb', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">KEEP ELEVATED</text>
 <ellipse cx="53" cy="88" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="69" y="81" width="90" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="161" cy="88" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="140" y1="88" x2="186" y2="55" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/>
 <line x1="186" y1="88" x2="186" y2="68" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="183,68 189,68 186,60" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Hold limb above heart</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Reduces blood loss</text>` },
   { label: 'Keep person flat', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">STAY FLAT</text>
 <ellipse cx="43" cy="80" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="73" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="80" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="10" y1="98" x2="190" y2="98" stroke="#555552" stroke-width="1.5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep flat , do not stand</text>` },
   { label: 'No food or water', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">NOTHING BY MOUTH</text>
 <text x="100" y="72" text-anchor="middle" fill="#888780" font-size="36" font-family="Arial"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">No food or water</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">May need surgery</text>` },
   { label: 'Stay with them , talk calmly', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">STAY WITH THEM</text>
 <ellipse cx="55" cy="60" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="41" y="76" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="118" cy="90" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="134" y="83" width="40" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="176" cy="90" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="48" text-anchor="middle" fill="#FFEAA0" font-size="9" font-family="Arial">You are doing well...</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep them conscious and calm</text>` },
  ],
 },
 burn: {
  l1: [
   { label: 'Cool water , 10 minutes', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 1 , COOL WATER</text>
 <rect x="85" y="22" width="30" height="8" rx="4" fill="#888780"/>
 <rect x="97" y="30" width="6" height="14" fill="#888780"/>
 <line x1="100" y1="44" x2="97" y2="72" stroke="#5DCAA5" stroke-width="3" stroke-linecap="round"/>
 <line x1="100" y1="48" x2="103" y2="72" stroke="#5DCAA5" stroke-width="2" opacity="0.6"/>
 <ellipse cx="100" cy="92" rx="30" ry="14" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <circle cx="155" cy="72" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="155" y="68" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">10</text>
 <text x="155" y="81" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Cool water , item 6 or tap</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Don't stop before 10 minutes</text>` },
   { label: 'No ice butter or cream', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DO NOT USE THESE</text>
 <text x="40" y="70" text-anchor="middle" fill="#888780" font-size="22"></text>
 <line x1="20" y1="45" x2="60" y2="85" stroke="#990011" stroke-width="3"/>
 <line x1="60" y1="45" x2="20" y2="85" stroke="#990011" stroke-width="3"/>
 <text x="100" y="70" text-anchor="middle" fill="#888780" font-size="22"></text>
 <line x1="80" y1="45" x2="120" y2="85" stroke="#990011" stroke-width="3"/>
 <line x1="120" y1="45" x2="80" y2="85" stroke="#990011" stroke-width="3"/>
 <text x="160" y="70" text-anchor="middle" fill="#888780" font-size="22"></text>
 <line x1="140" y1="45" x2="180" y2="85" stroke="#990011" stroke-width="3"/>
 <line x1="180" y1="45" x2="140" y2="85" stroke="#990011" stroke-width="3"/>
 <text x="100" y="108" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold" font-family="Arial">COOL WATER ONLY</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Ice makes burns worse</text>` },
   { label: 'Cover loosely with gauze', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 3 , COVER LOOSELY</text>
 <ellipse cx="100" cy="85" rx="35" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 65 72 Q 100 62 135 72 Q 135 100 100 108 Q 65 100 65 72" fill="#F5F5F0" opacity="0.5" stroke="#5DCAA5" stroke-width="1.5" stroke-dasharray="4,2"/>
 <text x="48" y="46" text-anchor="middle" fill="#5DCAA5" font-size="9"> Loose</text>
 <text x="155" y="46" text-anchor="middle" fill="#990011" font-size="9"> Tight</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Non-stick gauze , item 4</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Never wrap tightly</text>` },
   { label: 'Do not pop blisters', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DO NOT POP BLISTERS</text>
 <ellipse cx="100" cy="72" rx="28" ry="16" fill="#E8D4B0" opacity="0.6" stroke="#E0C48C" stroke-width="1.5"/>
 <ellipse cx="100" cy="69" rx="20" ry="10" fill="#F0E8D0" opacity="0.4"/>
 <line x1="145" y1="42" x2="112" y2="68" stroke="#888780" stroke-width="2"/>
 <polygon points="107,71 114,63 117,70" fill="#888780"/>
 <line x1="139" y1="37" x2="171" y2="69" stroke="#990011" stroke-width="3"/>
 <line x1="171" y1="37" x2="139" y2="69" stroke="#990011" stroke-width="3"/>
 <text x="100" y="112" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold" font-family="Arial">LEAVE INTACT</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Blisters protect against infection</text>` },
   { label: 'Pain relief if approved', svg: `<ellipse cx="100" cy="65" rx="28" ry="18" fill="#5DCAA5" opacity="0.4" stroke="#5DCAA5" stroke-width="2"/><text x="100" y="70" text-anchor="middle" fill="#5DCAA5" font-size="11" font-family="Arial">Pain Relief</text><rect x="62" y="88" width="76" height="20" rx="4" fill="#2E2E2C" stroke="#5DCAA5" stroke-width="1"/><text x="100" y="102" text-anchor="middle" fill="#5DCAA5" font-size="9" font-family="Arial">Item 7 , as labeled</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Only if approved here</text>` },
  ],
  l2: [
   { label: 'Cool water 15 minutes', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">15 MINUTES , DO NOT STOP</text>
 <rect x="82" y="20" width="36" height="9" rx="4" fill="#888780"/>
 <rect x="97" y="29" width="6" height="14" fill="#888780"/>
 <line x1="100" y1="43" x2="96" y2="76" stroke="#5DCAA5" stroke-width="3.5" stroke-linecap="round"/>
 <ellipse cx="100" cy="92" rx="32" ry="16" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <circle cx="155" cy="68" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="155" y="64" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">15</text>
 <text x="155" y="77" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">15 min , set timer now</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Face, hands, joints need medical care</text>` },
   { label: 'Do not remove stuck clothing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">LEAVE STUCK CLOTHING</text>
 <ellipse cx="100" cy="78" rx="38" ry="24" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="70" y="62" width="60" height="32" rx="6" fill="#888780" opacity="0.4"/>
 <line x1="76" y1="54" x2="124" y2="102" stroke="#990011" stroke-width="3"/>
 <line x1="124" y1="54" x2="76" y2="102" stroke="#990011" stroke-width="3"/>
 <text x="100" y="118" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DON'T REMOVE STUCK CLOTHING</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Leave for medical staff</text>` },
   { label: 'Cover loosely , not tight', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">COVER LOOSELY</text>
 <ellipse cx="100" cy="80" rx="35" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 65 67 Q 100 57 135 67 Q 135 95 100 103 Q 65 95 65 67" fill="#F5F5F0" opacity="0.4" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="4,2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Non-stick gauze , item 4</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Loose drape only , not wrapped</text>` },
   { label: 'Watch for shock signs', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">WATCH FOR SHOCK</text>
 <text x="55" y="72" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Pale skin</text>
 <text x="145" y="72" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Sweating</text>
 <text x="55" y="88" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Dizzy</text>
 <text x="145" y="88" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Weak</text>
 <text x="100" y="108" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">→ PRESS EMERGENCY</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Watch person constantly</text>` },
   { label: 'Keep calm and still', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="100" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="86" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep calm and still</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Sickbay/Med Assistant is coming</text>` },
   { label: 'Cut clothing from burn with scissors', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="28" font-family="Arial"></text><path d="M 60 75 L 140 75" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/><text x="100" y="100" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">CUT , do not pull over wound</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 10 , scissors</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Cut clothing away from wound</text>` },
  ],
  l3: [
   { label: 'Do not touch burned area', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DO NOT TOUCH</text>
 <text x="100" y="65" text-anchor="middle" fill="#888780" font-size="36"></text>
 <line x1="68" y1="28" x2="132" y2="92" stroke="#990011" stroke-width="3"/>
 <line x1="132" y1="28" x2="68" y2="92" stroke="#990011" stroke-width="3"/>
 <text x="100" y="108" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold" font-family="Arial">HANDS OFF</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Emergency contacted</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not apply anything</text>` },
   { label: 'Keep person still and calm', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">KEEP STILL</text>
 <ellipse cx="43" cy="80" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="73" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="80" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="10" y1="98" x2="190" y2="98" stroke="#555552" stroke-width="1.5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not move them</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Clinic is coming to you</text>` },
   { label: 'Move to fresh air if safe', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">FRESH AIR IF SAFE</text>
 <text x="65" y="75" text-anchor="middle" fill="#888780" font-size="28"></text>
 <line x1="90" y1="75" x2="122" y2="75" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="122,72 130,75 122,78" fill="#5DCAA5"/>
 <text x="155" y="75" text-anchor="middle" fill="#5DCAA5" font-size="26"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Only move if smoke present</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not move if injury is severe</text>` },
   { label: 'Chemical , remove if not stuck then rinse', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="100" cy="78" rx="38" ry="24" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="72" y="63" width="56" height="30" rx="6" fill="#888780" opacity="0.4"/><text x="100" y="58" text-anchor="middle" fill="#5DCAA5" font-size="9" font-family="Arial">Chemical: remove if not stuck</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Then rinse with cool water</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Leave stuck clothing for doctors</text>` },
   { label: 'Emergency contacted , stay still', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="72" text-anchor="middle" fill="#990011" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Emergency contacted</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Stay still , clinic is coming</text>` },
  ],
  waiting: [
   { label: 'Do not touch burn', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">HANDS OFF</text>
 <text x="100" y="65" text-anchor="middle" fill="#888780" font-size="36"></text>
 <line x1="68" y1="28" x2="132" y2="92" stroke="#990011" stroke-width="3"/>
 <line x1="132" y1="28" x2="68" y2="92" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not touch the burn</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">No cream, ice or butter</text>` },
   { label: 'Do not remove stuck clothing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">LEAVE CLOTHING</text>
 <ellipse cx="100" cy="78" rx="38" ry="24" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="72" y="63" width="56" height="30" rx="6" fill="#888780" opacity="0.4"/>
 <line x1="78" y1="56" x2="122" y2="100" stroke="#990011" stroke-width="3"/>
 <line x1="122" y1="56" x2="78" y2="100" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Leave for medical staff</text>` },
   { label: 'Keep person still', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">KEEP STILL</text>
 <ellipse cx="43" cy="80" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="73" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="80" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not move them</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Help is on the way</text>` },
   { label: 'Small sips of water if conscious', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">SMALL SIPS ONLY</text>
 <text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Small sips if awake</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Burns cause dehydration</text>` },
   { label: 'Small sips if conscious', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="68" text-anchor="middle" fill="#5DCAA5" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Small sips if conscious</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Burns cause dehydration</text>` },
   { label: 'Move to fresh air if smoke', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="65" y="75" text-anchor="middle" fill="#888780" font-size="22" font-family="Arial"></text><text x="135" y="75" text-anchor="middle" fill="#5DCAA5" font-size="22" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Fresh air if smoke present</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Only if safe to move</text>` },
  ],
 },
 headache: {
  l1: [
   { label: 'Move to quiet dark cool area', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 1 , QUIET PLACE</text>
 <ellipse cx="55" cy="65" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="41" y="81" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="78" y1="80" x2="110" y2="80" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="110,77 118,80 110,83" fill="#5DCAA5"/>
 <rect x="120" y="48" width="55" height="62" rx="5" fill="none" stroke="#5DCAA5" stroke-width="1.5"/>
 <text x="147" y="72" text-anchor="middle" fill="#5DCAA5" font-size="9">Cool</text>
 <text x="147" y="84" text-anchor="middle" fill="#5DCAA5" font-size="9">Quiet</text>
 <text x="147" y="96" text-anchor="middle" fill="#5DCAA5" font-size="9">Dark</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Away from noise and light</text>` },
   { label: 'Drink water slowly', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 2 , WATER</text>
 <path d="M 75 38 L 70 118 L 130 118 L 125 38 Z" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <rect x="71" y="78" width="58" height="38" fill="#5DCAA5" opacity="0.25"/>
 <text x="100" y="107" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">H₂O</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Small sips , take your time</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Most headaches are dehydration</text>` },
   { label: 'Take pain relief if approved', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 3 , PAIN RELIEF</text>
 <ellipse cx="100" cy="68" rx="28" ry="18" fill="#5DCAA5" opacity="0.4" stroke="#5DCAA5" stroke-width="2"/>
 <line x1="100" y1="50" x2="100" y2="86" stroke="#5DCAA5" stroke-width="2"/>
 <text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="11">Pain</text>
 <text x="100" y="79" text-anchor="middle" fill="#5DCAA5" font-size="11">Relief</text>
 <rect x="62" y="90" width="76" height="20" rx="4" fill="#2E2E2C" stroke="#5DCAA5" stroke-width="1"/>
 <text x="100" y="104" text-anchor="middle" fill="#5DCAA5" font-size="9">Item 7 , as labeled</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Only if approved here</text>` },
   { label: 'Rest 15-20 minutes', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 4 , REST</text>
 <ellipse cx="100" cy="58" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="86" y="74" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="90" y1="52" x2="97" y2="52" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="103" y1="52" x2="110" y2="52" stroke="#E0D4C0" stroke-width="2"/>
 <circle cx="155" cy="80" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="155" y="76" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">15</text>
 <text x="155" y="89" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Close eyes, breathe slowly</text>` },
   { label: 'Watch , press help if worsens', svg: `<text x="100" y="58" text-anchor="middle" fill="#5DCAA5" font-size="22" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Watch , note any changes</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Tell medical staff everything</text>` },
  ],
  l2: [
   { label: 'Help person lie down', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">MODERATE , LIE DOWN</text>
 <ellipse cx="43" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="75" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="10" y1="100" x2="190" y2="100" stroke="#555552" stroke-width="1.5"/>
 <line x1="100" y1="45" x2="100" y2="70" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="97,70 103,70 100,62" fill="#5DCAA5"/>
 <text x="100" y="42" text-anchor="middle" fill="#5DCAA5" font-size="10">→ Lie down now</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Quiet dark cool area</text>` },
   { label: 'Loosen tight clothing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">LOOSEN COLLAR</text>
 <ellipse cx="100" cy="58" rx="22" ry="25" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 85 75 Q 100 83 115 75" fill="none" stroke="#888780" stroke-width="3"/>
 <line x1="80" y1="74" x2="65" y2="80" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="63,75 63,84 70,79" fill="#5DCAA5"/>
 <line x1="120" y1="74" x2="135" y2="80" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="137,75 137,84 130,79" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Collar, tie, chest , loosen all</text>` },
   { label: 'Offer water', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">OFFER WATER</text>
 <text x="100" y="72" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Small sips if not nauseous</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not force</text>` },
   { label: 'Watch , press emergency if worsens', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">WATCH CLOSELY</text>
 <text x="65" y="68" text-anchor="middle" fill="#888780" font-size="10">Vomiting</text>
 <text x="135" y="68" text-anchor="middle" fill="#888780" font-size="10">Confusion</text>
 <text x="65" y="85" text-anchor="middle" fill="#888780" font-size="10">Weakness</text>
 <text x="135" y="85" text-anchor="middle" fill="#888780" font-size="10">Vision</text>
 <text x="100" y="108" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold">→ If any appear: EMERGENCY</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Sickbay/Med Assistant has been alerted</text>` },
   { label: 'Do not leave them alone', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="55" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="41" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Never leave them alone</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Keep watching closely</text>` },
  ],
  l3: [
   { label: 'Keep person completely still', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DO NOT MOVE THEM</text>
 <ellipse cx="43" cy="80" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="73" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="80" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="110" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold">STILL , DO NOT MOVE</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Emergency contacted</text>` },
   { label: 'No medication at all', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">NO MEDICATION</text>
 <ellipse cx="100" cy="65" rx="28" ry="18" fill="#888780" opacity="0.3"/>
 <line x1="76" y1="41" x2="124" y2="89" stroke="#990011" stroke-width="3"/>
 <line x1="124" y1="41" x2="76" y2="89" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">No medication</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Masks symptoms doctors need</text>` },
   { label: 'If vomits , turn on side', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">VOMITING , SIDE</text>
 <ellipse cx="43" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="75" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="110" text-anchor="middle" fill="#5DCAA5" font-size="10">If vomiting: turn gently on side</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Prevents choking</text>` },
   { label: 'Emergency contacted', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="72" text-anchor="middle" fill="#990011" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Emergency contacted</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Keep them completely still</text>` },
   { label: 'Stay with them talk calmly', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="55" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="41" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Talk calmly , stay with them</text>` },
  ],
  waiting: [
   { label: 'Keep still , do not move', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">DO NOT MOVE</text>
 <ellipse cx="43" cy="78" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="71" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="78" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep completely still</text>` },
   { label: 'No medication', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">NO MEDICATION</text>
 <text x="100" y="72" text-anchor="middle" fill="#888780" font-size="28"></text>
 <line x1="74" y1="39" x2="126" y2="91" stroke="#990011" stroke-width="3"/>
 <line x1="126" y1="39" x2="74" y2="91" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">No medication , masks symptoms</text>` },
   { label: 'Dim lights reduce noise', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">QUIET AND DARK</text>
 <text x="65" y="72" text-anchor="middle" fill="#888780" font-size="24"></text>
 <text x="135" y="72" text-anchor="middle" fill="#888780" font-size="24"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Dim lights , reduce noise</text>` },
   { label: 'Note when headache started', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">NOTE THE TIME</text>
 <text x="100" y="68" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Note when it started</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Tell medical staff</text>` },
   { label: 'Check breathing if collapse', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="24" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">If collapse , check breathing</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Recovery position on side if breathing</text>` },
   { label: 'Note when it started', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="68" text-anchor="middle" fill="#FFEAA0" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Note the time it started</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Tell medical staff</text>` },
  ],
 },
 fainting: {
  l1: [
   { label: 'Lay flat on back', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 1 , LAY FLAT</text>
 <ellipse cx="43" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="75" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="10" y1="100" x2="190" y2="100" stroke="#555552" stroke-width="1.5"/>
 <line x1="100" y1="42" x2="100" y2="70" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="97,70 103,70 100,62" fill="#5DCAA5"/>
 <text x="100" y="40" text-anchor="middle" fill="#5DCAA5" font-size="10">→ Lay down now</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">On their back , flat</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not sit them up yet</text>` },
   { label: 'Raise legs above heart', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 2 , RAISE LEGS</text>
 <ellipse cx="53" cy="85" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="69" y="78" width="90" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="161" cy="85" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="130" y1="85" x2="180" y2="52" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="180" cy="50" rx="13" ry="9" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="65" y="74" text-anchor="middle" fill="#990011" font-size="12"></text>
 <line x1="180" y1="88" x2="180" y2="66" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="177,66 183,66 180,58" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Lift legs 30cm , above heart</text>` },
   { label: 'Loosen tight clothing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 3 , LOOSEN</text>
 <ellipse cx="100" cy="58" rx="22" ry="25" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 85 76 Q 100 84 115 76" fill="none" stroke="#888780" stroke-width="3"/>
 <line x1="80" y1="75" x2="62" y2="81" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="60,76 60,85 68,80" fill="#5DCAA5"/>
 <line x1="120" y1="75" x2="138" y2="81" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="140,76 140,85 132,80" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Collar, chest, waist , loosen</text>` },
   { label: 'Give small sips of water', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 4 , WATER</text>
 <text x="100" y="68" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Only when fully alert</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Small sips , no rushing</text>` },
   { label: 'Monitor 15 min before standing', svg: `<circle cx="100" cy="68" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/><text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="13" font-weight="bold" font-family="Arial">15</text><text x="100" y="77" text-anchor="middle" fill="#5DCAA5" font-size="7" font-family="Arial">min</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Monitor 15 min before standing</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Watch for dizziness</text>` },
  ],
  l2: [
   { label: 'Keep person flat', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">MODERATE , STAY FLAT</text>
 <ellipse cx="43" cy="80" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="73" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="80" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="10" y1="98" x2="190" y2="98" stroke="#555552" stroke-width="1.5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not sit them up yet</text>` },
   { label: 'Loosen clothing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">LOOSEN CLOTHING</text>
 <ellipse cx="100" cy="58" rx="22" ry="25" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 85 76 Q 100 84 115 76" fill="none" stroke="#888780" stroke-width="3"/>
 <line x1="78" y1="75" x2="60" y2="82" stroke="#5DCAA5" stroke-width="2"/>
 <line x1="122" y1="75" x2="140" y2="82" stroke="#5DCAA5" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Neck, chest, waist , loosen</text>` },
   { label: 'Check breathing every 30 sec', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">CHECK BREATHING</text>
 <ellipse cx="70" cy="72" rx="22" ry="26" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 70 67 Q 80 74 75 82" fill="none" stroke="#E0D4C0" stroke-width="1.5"/>
 <ellipse cx="130" cy="74" rx="25" ry="14" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <circle cx="162" cy="38" r="18" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="162" y="34" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">30s</text>
 <text x="162" y="47" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Look, Listen, Feel</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Every 30 seconds</text>` },
   { label: 'Stay with them', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">STAY WITH THEM</text>
 <ellipse cx="55" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="41" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="118" cy="90" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="134" y="83" width="40" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="176" cy="90" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not leave them alone</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Sickbay/Med Assistant has been alerted</text>` },
   { label: 'Watch , emergency if worsens', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#990011" font-size="22" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">If breathing stops = EMERGENCY</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Keep watching constantly</text>` },
  ],
  l3: [
   { label: 'Check breathing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">CHECK BREATHING NOW</text>
 <ellipse cx="70" cy="72" rx="22" ry="26" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="78" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Look, Listen, Feel , 10 seconds</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Check every 30 seconds</text>` },
   { label: 'If breathing , recovery position', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">RECOVERY POSITION</text>
 <ellipse cx="38" cy="80" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="55" y1="80" x2="155" y2="75" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/>
 <line x1="80" y1="75" x2="110" y2="95" stroke="#E0D4C0" stroke-width="6" stroke-linecap="round"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">ON THEIR SIDE , head tilted back</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Prevents choking if they vomit</text>` },
   { label: 'If no breathing , begin CPR', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">CPR IF TRAINED</text>
 <ellipse cx="43" cy="75" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="68" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="75" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="55" text-anchor="middle" fill="#990011" font-size="24"></text>
 <text x="100" y="108" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold">30 COMPRESSIONS , 2 BREATHS</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Only if trained , Emergency coming</text>` },
   { label: 'Nothing by mouth', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">NOTHING BY MOUTH</text>
 <text x="100" y="72" text-anchor="middle" fill="#888780" font-size="36"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">No food , no water , no medication</text>` },
   { label: 'Emergency contacted stay with them', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="72" text-anchor="middle" fill="#990011" font-size="28" font-family="Arial"></text><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Emergency contacted</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Stay beside them , never leave</text>` },
  ],
  waiting: [
   { label: 'Keep checking breathing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">KEEP CHECKING</text>
 <text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Check breathing every 30 seconds</text>` },
   { label: 'Keep on side if breathing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">STAY ON SIDE</text>
 <ellipse cx="43" cy="78" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="59" y="71" width="110" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="171" cy="78" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Recovery position , on their side</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Prevents choking</text>` },
   { label: 'CPR if not breathing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">CPR IF NO BREATHING</text>
 <text x="100" y="65" text-anchor="middle" fill="#990011" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">30 compressions , 2 breaths</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Repeat , Emergency is coming</text>` },
   { label: 'Do not leave them alone', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">STAY WITH THEM</text>
 <ellipse cx="55" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="41" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="118" cy="88" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="134" y="81" width="40" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="176" cy="88" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Never leave , keep watching</text>` },
   { label: 'Never leave them alone', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="55" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="41" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Never leave them alone</text>` },
   { label: 'Loosen tight clothing', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="100" cy="58" rx="22" ry="25" fill="none" stroke="#E0D4C0" stroke-width="2"/><path d="M 85 76 Q 100 84 115 76" fill="none" stroke="#888780" stroke-width="3"/><line x1="80" y1="75" x2="62" y2="82" stroke="#5DCAA5" stroke-width="2"/><line x1="120" y1="75" x2="138" y2="82" stroke="#5DCAA5" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Loosen collar and chest</text>` },
   { label: 'Note any seizure activity', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#FFEAA0" font-size="24" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Note any seizure activity</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Tell medical staff</text>` },
  ],
 },
 allergic: {
  l1: [
   { label: 'Remove from trigger', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 1 , MOVE AWAY</text>
 <text x="40" y="78" text-anchor="middle" fill="#F0C840" font-size="22"></text>
 <ellipse cx="135" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="121" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="68" y1="78" x2="104" y2="78" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="104,75 112,78 104,81" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Move away from trigger</text>` },
   { label: 'Give antihistamine if approved', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 2 , ANTIHISTAMINE</text>
 <ellipse cx="100" cy="65" rx="28" ry="18" fill="#5DCAA5" opacity="0.4" stroke="#5DCAA5" stroke-width="2"/>
 <text x="100" y="70" text-anchor="middle" fill="#5DCAA5" font-size="11">Anti-H</text>
 <rect x="62" y="88" width="76" height="20" rx="4" fill="#2E2E2C" stroke="#5DCAA5" stroke-width="1"/>
 <text x="100" y="102" text-anchor="middle" fill="#5DCAA5" font-size="9">Item 8 , as labeled</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Only if approved here</text>` },
   { label: 'Monitor 30 minutes', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 3 , WATCH</text>
 <circle cx="100" cy="75" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="100" y="71" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">30</text>
 <text x="100" y="84" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Watch for 30 minutes</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Any swelling = Emergency</text>` },
   { label: 'Watch for swelling', svg: `<ellipse cx="65" cy="70" rx="22" ry="26" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="38" cy="80" rx="12" ry="15" fill="none" stroke="#5DCAA5" stroke-width="1.5"/><ellipse cx="38" cy="80" rx="7" ry="9" fill="#5DCAA5" opacity="0.3"/><text x="38" y="100" text-anchor="middle" fill="#5DCAA5" font-size="7" font-family="Arial">Open </text><ellipse cx="150" cy="80" rx="12" ry="15" fill="none" stroke="#990011" stroke-width="1.5"/><ellipse cx="150" cy="80" rx="11" ry="14" fill="#990011" opacity="0.4"/><ellipse cx="150" cy="80" rx="3" ry="4" fill="#1C1C1A"/><text x="150" y="100" text-anchor="middle" fill="#990011" font-size="7" font-family="Arial">BLOCKED </text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Swelling = Emergency</text>` },
   { label: 'Keep calm and seated', svg: `<ellipse cx="100" cy="65" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="86" y="81" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep calm and seated</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not walk around</text>` },
  ],
  l2: [
   { label: 'Keep person seated and calm', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">STAY SEATED</text>
 <ellipse cx="100" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="86" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Seated , do not walk around</text>` },
   { label: 'Give antihistamine now', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">ANTIHISTAMINE NOW</text>
 <text x="100" y="68" text-anchor="middle" fill="#5DCAA5" font-size="26"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 8 , give immediately</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">If approved at your institution</text>` },
   { label: 'Watch face lips throat', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">WATCH THROAT</text>
 <ellipse cx="70" cy="72" rx="22" ry="26" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="40" cy="82" rx="14" ry="18" fill="none" stroke="#5DCAA5" stroke-width="1.5"/>
 <ellipse cx="40" cy="82" rx="8" ry="10" fill="#5DCAA5" opacity="0.3"/>
 <text x="40" y="105" text-anchor="middle" fill="#5DCAA5" font-size="8">Open </text>
 <ellipse cx="155" cy="82" rx="14" ry="18" fill="none" stroke="#990011" stroke-width="1.5"/>
 <ellipse cx="155" cy="82" rx="13" ry="17" fill="#990011" opacity="0.4"/>
 <ellipse cx="155" cy="82" rx="3" ry="4" fill="#1C1C1A"/>
 <text x="155" y="105" text-anchor="middle" fill="#990011" font-size="8">DANGER </text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Swelling = Emergency NOW</text>` },
   { label: 'Watch breathing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">WATCH BREATHING</text>
 <text x="100" y="68" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="100" text-anchor="middle" fill="#888780" font-size="10">Wheezing = EMERGENCY</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Listen for wheezing or hissing</text>` },
   { label: 'Breathing changes emergency now', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="58" text-anchor="middle" fill="#990011" font-size="20" font-family="Arial"></text><text x="100" y="88" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Wheezing = EMERGENCY</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Breathing changes = EMERGENCY</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not wait</text>` },
  ],
  l3: [
   { label: 'EpiPen into outer thigh', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">EPIPEN NOW</text>
 <rect x="88" y="35" width="24" height="70" rx="8" fill="#5DCAA5" opacity="0.5" stroke="#5DCAA5" stroke-width="2"/>
 <text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="8">Epi</text>
 <text x="100" y="74" text-anchor="middle" fill="#5DCAA5" font-size="8">Pen</text>
 <line x1="100" y1="108" x2="100" y2="104" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="97,104 103,104 100,96" fill="#5DCAA5"/>
 <text x="100" y="116" text-anchor="middle" fill="#5DCAA5" font-size="10">Outer thigh , through clothing</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Hold 10 seconds</text>` },
   { label: 'Lay flat legs raised', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">LAY FLAT , LEGS UP</text>
 <ellipse cx="53" cy="85" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="69" y="78" width="90" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="161" cy="85" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="130" y1="85" x2="178" y2="52" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/>
 <line x1="178" y1="88" x2="178" y2="66" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="175,66 181,66 178,58" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Flat , legs raised</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Unless breathing is difficult</text>` },
   { label: 'If breathing hard , sit up slightly', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">BREATHING HARD</text>
 <ellipse cx="100" cy="60" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="86" y="76" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Breathing difficult = sit up</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Semi-upright position</text>` },
   { label: 'Nothing by mouth', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="65" y="72" text-anchor="middle" fill="#888780" font-size="24" font-family="Arial"></text><line x1="43" y1="43" x2="87" y2="87" stroke="#990011" stroke-width="3"/><line x1="87" y1="43" x2="43" y2="87" stroke="#990011" stroke-width="3"/><text x="135" y="72" text-anchor="middle" fill="#888780" font-size="24" font-family="Arial"></text><line x1="113" y1="43" x2="157" y2="87" stroke="#990011" stroke-width="3"/><line x1="157" y1="43" x2="113" y2="87" stroke="#990011" stroke-width="3"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">NOTHING BY MOUTH</text>` },
   { label: 'CPR if not breathing', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#990011" font-size="24" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">30 compressions 2 breaths</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Only if trained , clinic coming</text>` },
  ],
  waiting: [
   { label: 'Use EpiPen if available', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">EPIPEN</text>
 <text x="100" y="68" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Outer thigh , hold 10 sec</text>` },
   { label: 'Keep flat legs raised', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">FLAT , LEGS UP</text>
 <ellipse cx="53" cy="85" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="69" y="78" width="90" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="161" cy="85" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="130" y1="85" x2="178" y2="52" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Unless breathing is difficult</text>` },
   { label: 'Watch throat and breathing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">WATCH AIRWAY</text>
 <text x="100" y="68" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Watch breathing closely</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Help is on the way</text>` },
   { label: 'No antihistamine too slow', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="65" text-anchor="middle" fill="#888780" font-size="24" font-family="Arial"></text><line x1="74" y1="32" x2="126" y2="84" stroke="#990011" stroke-width="3"/><line x1="126" y1="32" x2="74" y2="84" stroke="#990011" stroke-width="3"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Antihistamine too slow</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">EpiPen only for anaphylaxis</text>` },
   { label: 'Nothing by mouth', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="68" text-anchor="middle" fill="#888780" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Nothing by mouth at all</text>` },
   { label: 'Second EpiPen if needed', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="24" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">2nd EpiPen after 5-15 min</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">If symptoms return</text>` },
   { label: 'Watch closely can worsen fast', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="26" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Watch closely , can worsen fast</text>` },
  ],
 },
 sprain: {
  l1: [
   { label: 'Rest , stop using it', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 1 , REST</text>
 <text x="65" y="75" text-anchor="middle" fill="#5DCAA5" font-size="22"></text>
 <ellipse cx="140" cy="82" rx="28" ry="16" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="120" y1="55" x2="160" y2="95" stroke="#990011" stroke-width="3"/>
 <line x1="160" y1="55" x2="120" y2="95" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Stop all movement now</text>` },
   { label: 'Cold pack in cloth , 15 min', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 2 , COLD PACK</text>
 <ellipse cx="90" cy="88" rx="30" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="64" y="72" width="52" height="32" rx="8" fill="#5DCAA5" opacity="0.3" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="4,2"/>
 <text x="90" y="91" text-anchor="middle" fill="#5DCAA5" font-size="8">Cold pack</text>
 <circle cx="158" cy="72" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="158" y="68" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">15</text>
 <text x="158" y="81" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 6 , wrapped in cloth</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Never direct ice on skin</text>` },
   { label: 'Wrap with elastic bandage', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 3 , WRAP</text>
 <ellipse cx="100" cy="88" rx="30" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="100" cy="80" rx="34" ry="10" fill="none" stroke="#5DCAA5" stroke-width="2.5" opacity="0.9"/>
 <ellipse cx="100" cy="88" rx="36" ry="12" fill="none" stroke="#5DCAA5" stroke-width="2.5" opacity="0.7"/>
 <ellipse cx="100" cy="96" rx="34" ry="10" fill="none" stroke="#5DCAA5" stroke-width="2.5" opacity="0.5"/>
 <path d="M 136 78 Q 145 86 136 96" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="132,95 139,98 136,88" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Firm , not too tight</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Item 2 , elastic bandage</text>` },
   { label: 'Elevate above heart', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 4 , ELEVATE</text>
 <ellipse cx="35" cy="65" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="21" y="81" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="48" y1="88" x2="155" y2="60" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="158" cy="58" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="140" y="68" width="50" height="12" rx="6" fill="#555552" opacity="0.5"/>
 <line x1="158" y1="92" x2="158" y2="80" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="155,80 161,80 158,72" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Use pillow or rolled clothing</text>` },
   { label: 'Watch , press help if cannot bear weight', svg: `<ellipse cx="100" cy="85" rx="28" ry="16" fill="none" stroke="#E0D4C0" stroke-width="2"/><line x1="78" y1="58" x2="122" y2="102" stroke="#990011" stroke-width="3"/><line x1="122" y1="58" x2="78" y2="102" stroke="#990011" stroke-width="3"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Cannot bear weight</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Possible fracture , X-ray needed</text>` },
  ],
  l2: [
   { label: 'Keep completely still', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">DO NOT MOVE</text>
 <ellipse cx="100" cy="82" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="76" y1="54" x2="124" y2="102" stroke="#990011" stroke-width="3"/>
 <line x1="124" y1="54" x2="76" y2="102" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not walk or move joint</text>` },
   { label: 'Apply cold pack', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">COLD PACK NOW</text>
 <ellipse cx="90" cy="88" rx="30" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="64" y="72" width="52" height="32" rx="8" fill="#5DCAA5" opacity="0.3" stroke="#5DCAA5" stroke-width="2"/>
 <circle cx="158" cy="72" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="158" y="68" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">15</text>
 <text x="158" y="81" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 6 , wrapped in cloth</text>` },
   { label: 'Do not straighten or adjust', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">DO NOT ADJUST</text>
 <ellipse cx="100" cy="80" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="78" y1="54" x2="122" y2="98" stroke="#990011" stroke-width="3"/>
 <line x1="122" y1="54" x2="78" y2="98" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not push or pull joint</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Possible fracture , X-ray needed</text>` },
   { label: 'Watch for numbness or colour', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">WATCH SIGNS</text>
 <text x="55" y="72" text-anchor="middle" fill="#888780" font-size="10">Pale</text>
 <text x="145" y="72" text-anchor="middle" fill="#888780" font-size="10">Numb</text>
 <text x="55" y="88" text-anchor="middle" fill="#888780" font-size="10">Blue</text>
 <text x="145" y="88" text-anchor="middle" fill="#888780" font-size="10">Cold</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Any of these = Emergency</text>` },
   { label: 'Keep elevated and calm', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><line x1="140" y1="82" x2="182" y2="52" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Elevated and calm</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Sickbay/Med Assistant is coming</text>` },
  ],
  l3: [
   { label: 'Do not move bone or joint', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DO NOT MOVE</text>
 <ellipse cx="100" cy="80" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="72" y1="48" x2="128" y2="104" stroke="#990011" stroke-width="3"/>
 <line x1="128" y1="48" x2="72" y2="104" stroke="#990011" stroke-width="3"/>
 <text x="100" y="116" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold">DO NOT TOUCH OR ADJUST</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Emergency contacted</text>` },
   { label: 'Immobilize as found', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">IMMOBILIZE AS IS</text>
 <ellipse cx="100" cy="80" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 65 65 Q 100 55 135 65 L 138 95 Q 100 105 62 95 Z" fill="none" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="4,2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Support , do not change position</text>` },
   { label: 'Cold pack nearby , not on deformity', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">COLD PACK NEARBY</text>
 <ellipse cx="80" cy="85" rx="28" ry="16" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="110" y="72" width="44" height="28" rx="8" fill="#5DCAA5" opacity="0.3" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="4,2"/>
 <line x1="92" y1="86" x2="102" y2="86" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="102,83 110,86 102,89" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Near injury , not on deformity</text>` },
   { label: 'Emergency contacted', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="72" text-anchor="middle" fill="#990011" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Emergency contacted</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not move the bone or joint</text>` },
   { label: 'Keep still until help arrives', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep completely still</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Help is on the way</text>` },
  ],
  // Level-aware: frames are ordered to match l2.waitingSteps / l3.waitingSteps
  // 1:1, index for index, so the visual always matches what's being read.
  waiting: {
   l2: [
    { label: 'Keep completely still', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">DO NOT MOVE</text>
 <ellipse cx="100" cy="82" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="76" y1="54" x2="124" y2="102" stroke="#990011" stroke-width="3"/>
 <line x1="124" y1="54" x2="76" y2="102" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not walk or move joint</text>` },
    { label: 'Cold pack in cloth , 15 min', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">COLD PACK</text>
 <ellipse cx="90" cy="88" rx="30" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="64" y="72" width="52" height="32" rx="8" fill="#5DCAA5" opacity="0.3" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="4,2"/>
 <text x="90" y="91" text-anchor="middle" fill="#5DCAA5" font-size="8">Cold pack</text>
 <circle cx="158" cy="72" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="158" y="68" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">15</text>
 <text x="158" y="81" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 6 , wrapped in cloth</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Never direct ice on skin</text>` },
    { label: 'Do not straighten or adjust', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">DO NOT ADJUST</text>
 <ellipse cx="100" cy="80" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="78" y1="54" x2="122" y2="98" stroke="#990011" stroke-width="3"/>
 <line x1="122" y1="54" x2="78" y2="98" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not push or pull joint</text>` },
    { label: 'Elevate above heart', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">ELEVATE GENTLY</text>
 <ellipse cx="35" cy="65" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="21" y="81" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="48" y1="88" x2="155" y2="60" stroke="#E0D4C0" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="158" cy="58" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="140" y="68" width="50" height="12" rx="6" fill="#555552" opacity="0.5"/>
 <line x1="158" y1="92" x2="158" y2="80" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <polygon points="155,80 161,80 158,72" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Use pillow or rolled clothing</text>` },
    { label: 'Reassure calmly , help is coming', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">STAY CALM</text>
 <ellipse cx="55" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="41" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="118" cy="90" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="134" y="83" width="40" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="176" cy="90" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Tell them help is coming</text>` },
    { label: 'Keep monitoring', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">KEEP WATCHING</text>
 <ellipse cx="100" cy="82" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <circle cx="100" cy="80" r="36" fill="none" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="4,3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Help is already on the way</text>` }
   ],
   l3: [
    { label: 'Do not move bone or joint', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">DO NOT MOVE</text>
 <line x1="70" y1="42" x2="130" y2="102" stroke="#990011" stroke-width="3"/>
 <line x1="130" y1="42" x2="70" y2="102" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not straighten or realign</text>` },
    { label: 'Immobilize as found', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">IMMOBILIZE AS IS</text>
 <ellipse cx="100" cy="80" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 65 65 Q 100 55 135 65 L 138 95 Q 100 105 62 95 Z" fill="none" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="4,2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Support , do not change position</text>` },
    { label: 'Do not remove shoes or clothing', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">LEAVE AS IS</text>
 <rect x="72" y="60" width="56" height="40" rx="6" fill="#888780" opacity="0.4"/>
 <ellipse cx="100" cy="90" rx="30" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="78" y1="52" x2="122" y2="108" stroke="#990011" stroke-width="3"/>
 <line x1="122" y1="52" x2="78" y2="108" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not remove shoes or clothing</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Medical staff will do this safely</text>` },
    { label: 'Cold pack nearby , not on deformity', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">COLD PACK NEARBY</text>
 <ellipse cx="80" cy="85" rx="28" ry="16" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="110" y="72" width="44" height="28" rx="8" fill="#5DCAA5" opacity="0.3" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="4,2"/>
 <line x1="92" y1="86" x2="102" y2="86" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="102,83 110,86 102,89" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Near injury , not on deformity</text>` },
    { label: 'Keep lying down', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep flat , do not sit up</text>` },
    { label: 'No food or water', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="65" y="72" text-anchor="middle" fill="#888780" font-size="24" font-family="Arial"></text><line x1="43" y1="43" x2="87" y2="87" stroke="#990011" stroke-width="3"/><line x1="87" y1="43" x2="43" y2="87" stroke="#990011" stroke-width="3"/><text x="135" y="72" text-anchor="middle" fill="#888780" font-size="24" font-family="Arial"></text><line x1="113" y1="43" x2="157" y2="87" stroke="#990011" stroke-width="3"/><line x1="157" y1="43" x2="113" y2="87" stroke="#990011" stroke-width="3"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Nothing by mouth , surgery risk</text>` },
    { label: 'Keep warm , shock risk', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="68" text-anchor="middle" fill="#5DCAA5" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep warm , shock is a real risk</text>` }
   ]
  },
 },
 eyeinjury: {
  l1: [
   { label: 'Do NOT rub', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DO NOT RUB EYE</text>
 <ellipse cx="100" cy="70" rx="40" ry="28" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <circle cx="100" cy="70" r="14" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <circle cx="100" cy="70" r="7" fill="#1C1C1A" stroke="#5DCAA5" stroke-width="1.5"/>
 <line x1="44" y1="34" x2="80" y2="70" stroke="#990011" stroke-width="3"/>
 <line x1="80" y1="34" x2="44" y2="70" stroke="#990011" stroke-width="3"/>
 <text x="100" y="115" text-anchor="middle" fill="#990011" font-size="12" font-weight="bold">HANDS AWAY FROM EYE</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Rubbing pushes debris deeper</text>` },
   { label: 'Rinse with eye wash 10 min', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 2 , RINSE</text>
 <rect x="52" y="28" width="26" height="55" rx="8" fill="#5DCAA5" opacity="0.4" stroke="#5DCAA5" stroke-width="2"/>
 <text x="65" y="60" text-anchor="middle" fill="#5DCAA5" font-size="7">Eye</text>
 <text x="65" y="70" text-anchor="middle" fill="#5DCAA5" font-size="7">Wash</text>
 <path d="M 78 55 Q 108 64 118 76" fill="none" stroke="#5DCAA5" stroke-width="2.5" stroke-linecap="round"/>
 <ellipse cx="130" cy="82" rx="32" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <circle cx="168" cy="38" r="18" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="168" y="34" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">10</text>
 <text x="168" y="47" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Rinse gently , item 11</text>` },
   { label: 'Cover with sterile eye pad', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 3 , COVER</text>
 <ellipse cx="80" cy="72" rx="30" ry="36" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="85" cy="65" rx="20" ry="13" fill="#F5F5F0" opacity="0.8" stroke="#5DCAA5" stroke-width="2"/>
 <line x1="68" y1="57" x2="58" y2="50" stroke="#5DCAA5" stroke-width="1.5"/>
 <line x1="102" y1="57" x2="112" y2="50" stroke="#5DCAA5" stroke-width="1.5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 12 , sterile eye pad</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Gentle , do not press hard</text>` },
   { label: 'Cover eye pad if irritation continues', svg: `<ellipse cx="80" cy="72" rx="30" ry="36" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="85" cy="65" rx="20" ry="13" fill="#F5F5F0" opacity="0.8" stroke="#5DCAA5" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 12 , sterile eye pad</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Gentle , continue if irritation</text>` },
   { label: 'If discomfort continues press help', svg: `<text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="24" font-family="Arial">‍</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Sickbay/Med Assistant alerted , eye exam needed</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Professional check required</text>` },
  ],
  l2: [
   { label: 'Continue rinsing 15 min', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">RINSE 15 MINUTES</text>
 <rect x="52" y="28" width="26" height="55" rx="8" fill="#5DCAA5" opacity="0.4" stroke="#5DCAA5" stroke-width="2"/>
 <path d="M 78 52 Q 108 62 118 74" fill="none" stroke="#5DCAA5" stroke-width="3" stroke-linecap="round"/>
 <ellipse cx="130" cy="80" rx="32" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <circle cx="168" cy="36" r="18" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="168" y="32" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">15</text>
 <text x="168" y="45" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not stop before 15 min</text>` },
   { label: 'Do not remove anything', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">DO NOT REMOVE</text>
 <ellipse cx="100" cy="68" rx="40" ry="28" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="72" y1="40" x2="128" y2="96" stroke="#990011" stroke-width="3"/>
 <line x1="128" y1="40" x2="72" y2="96" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not touch what is in the eye</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Sickbay/Med Assistant alerted , they will check</text>` },
   { label: 'Cover with eye pad', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">COVER BOTH EYES</text>
 <ellipse cx="80" cy="70" rx="30" ry="36" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="85" cy="63" rx="20" ry="13" fill="#F5F5F0" opacity="0.8" stroke="#5DCAA5" stroke-width="2"/>
 <ellipse cx="65" cy="70" rx="14" ry="9" fill="#F5F5F0" opacity="0.6" stroke="#5DCAA5" stroke-width="1.5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Cover both eyes , item 12</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Reduces movement of injured eye</text>` },
   { label: 'Sickbay/Med Assistant alerted eye exam needed', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="24" font-family="Arial">‍</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Sickbay/Med Assistant alerted , eye exam needed</text>` },
   { label: 'Keep hands away from eye', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="100" cy="68" rx="40" ry="28" fill="none" stroke="#E0D4C0" stroke-width="2"/><circle cx="100" cy="68" r="14" fill="none" stroke="#5DCAA5" stroke-width="2"/><line x1="80" y1="32" x2="120" y2="72" stroke="#990011" stroke-width="3"/><line x1="120" y1="32" x2="80" y2="72" stroke="#990011" stroke-width="3"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">KEEP HANDS AWAY</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not rub or touch</text>` },
  ],
  l3: [
   { label: 'Rinse chemical IMMEDIATELY', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">RINSE NOW</text>
 <rect x="52" y="28" width="26" height="55" rx="8" fill="#990011" opacity="0.5" stroke="#990011" stroke-width="2"/>
 <path d="M 78 52 Q 108 62 118 74" fill="none" stroke="#5DCAA5" stroke-width="4" stroke-linecap="round"/>
 <ellipse cx="130" cy="80" rx="32" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <circle cx="168" cy="36" r="18" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="168" y="32" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">15</text>
 <text x="168" y="45" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="115" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold">RINSE NOW , DO NOT STOP</text>` },
   { label: 'Do not remove embedded object', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DO NOT REMOVE</text>
 <ellipse cx="100" cy="68" rx="40" ry="28" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="70" y1="38" x2="130" y2="98" stroke="#990011" stroke-width="3"/>
 <line x1="130" y1="38" x2="70" y2="98" stroke="#990011" stroke-width="3"/>
 <text x="100" y="110" text-anchor="middle" fill="#990011" font-size="11" font-weight="bold">LEAVE FOR DOCTORS</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Emergency contacted</text>` },
   { label: 'Cover both eyes , keep still', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">COVER BOTH EYES</text>
 <ellipse cx="80" cy="70" rx="30" ry="36" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="85" cy="63" rx="20" ry="13" fill="#F5F5F0" opacity="0.8" stroke="#5DCAA5" stroke-width="2.5"/>
 <ellipse cx="65" cy="70" rx="14" ry="9" fill="#F5F5F0" opacity="0.7" stroke="#5DCAA5" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Both eyes covered , keep still</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not move eyes side to side</text>` },
   { label: 'Emergency contacted', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="72" text-anchor="middle" fill="#990011" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Emergency contacted</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Keep eyes covered and still</text>` },
   { label: 'Vision at risk calm and still', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="60" text-anchor="middle" fill="#990011" font-size="22" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Vision at serious risk</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Stay calm , help is coming</text>` },
  ],
  waiting: [
   { label: 'Keep rinsing if chemical', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">KEEP RINSING</text>
 <text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not stop rinsing</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">15 minutes minimum for chemical</text>` },
   { label: 'Do not remove objects', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">DO NOT REMOVE</text>
 <line x1="72" y1="40" x2="128" y2="96" stroke="#990011" stroke-width="3"/>
 <line x1="128" y1="40" x2="72" y2="96" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Leave for medical staff</text>` },
   { label: 'Keep eyes still and closed', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">KEEP EYES STILL</text>
 <text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="28"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Both eyes closed and still</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Clinic is coming</text>` },
   { label: 'Do not move eyes side to side', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="24" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Eyes closed and still</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Do not move eyes side to side</text>` },
   { label: 'Never rub the eye', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="100" cy="68" rx="40" ry="28" fill="none" stroke="#E0D4C0" stroke-width="2"/><line x1="80" y1="35" x2="120" y2="75" stroke="#990011" stroke-width="3"/><line x1="120" y1="35" x2="80" y2="75" stroke="#990011" stroke-width="3"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">NEVER RUB THE EYE</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Causes more damage</text>` },
   { label: 'Keep calm sudden movements worsen', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#5DCAA5" font-size="24" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Stay calm and still</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Sudden movements worsen eye injuries</text>` },
   { label: 'Tell staff what entered and when', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="62" text-anchor="middle" fill="#FFEAA0" font-size="24" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Tell staff: substance + time</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Exact substance and when it happened</text>` },
  ],
 },
 nosebleed: {
  l1: [
   { label: 'Sit upright , head forward', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 1 , SIT FORWARD</text>
 <ellipse cx="65" cy="60" rx="20" ry="22" fill="none" stroke="#5DCAA5" stroke-width="2.5"/>
 <rect x="54" y="79" width="22" height="32" rx="6" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <line x1="65" y1="82" x2="68" y2="95" stroke="#5DCAA5" stroke-width="1.5" stroke-dasharray="2,2"/>
 <text x="65" y="118" text-anchor="middle" fill="#5DCAA5" font-size="9"> Forward</text>
 <ellipse cx="148" cy="55" rx="20" ry="22" fill="none" stroke="#990011" stroke-width="2"/>
 <rect x="138" y="74" width="22" height="32" rx="6" fill="none" stroke="#990011" stroke-width="2"/>
 <line x1="130" y1="34" x2="166" y2="70" stroke="#990011" stroke-width="3"/>
 <line x1="166" y1="34" x2="130" y2="70" stroke="#990011" stroke-width="3"/>
 <text x="148" y="118" text-anchor="middle" fill="#990011" font-size="9"> Back</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Tilting back causes choking</text>` },
   { label: 'Pinch soft part , 10 minutes', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 2 , PINCH FIRMLY</text>
 <path d="M 85 38 Q 100 28 115 38 L 118 82 Q 100 92 82 82 Z" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="60" y="78" text-anchor="middle" fill="#5DCAA5" font-size="8">Soft</text>
 <text x="60" y="88" text-anchor="middle" fill="#5DCAA5" font-size="8">part</text>
 <ellipse cx="86" cy="74" rx="8" ry="5" fill="#E0D4C0" opacity="0.8"/>
 <ellipse cx="114" cy="74" rx="8" ry="5" fill="#E0D4C0" opacity="0.8"/>
 <line x1="75" y1="74" x2="84" y2="74" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="82,71 86,74 82,77" fill="#5DCAA5"/>
 <line x1="125" y1="74" x2="116" y2="74" stroke="#5DCAA5" stroke-width="2"/>
 <polygon points="118,71 114,74 118,77" fill="#5DCAA5"/>
 <circle cx="158" cy="74" r="22" fill="none" stroke="#5DCAA5" stroke-width="2"/>
 <text x="158" y="70" text-anchor="middle" fill="#5DCAA5" font-size="14" font-weight="bold" font-family="Arial">10</text>
 <text x="158" y="83" text-anchor="middle" fill="#5DCAA5" font-size="8" font-family="Arial">min</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Breathe through mouth</text>` },
   { label: 'Breathe through mouth', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 3 , MOUTH BREATHE</text>
 <ellipse cx="100" cy="65" rx="24" ry="28" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 88 78 Q 100 86 112 78" fill="none" stroke="#5DCAA5" stroke-width="2.5"/>
 <line x1="115" y1="75" x2="147" y2="75" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="147,72 155,75 147,78" fill="#5DCAA5"/>
 <text x="155" y="72" text-anchor="middle" fill="#5DCAA5" font-size="20"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Mouth open , breathe slowly</text>` },
   { label: 'Cold pack on bridge', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STEP 4 , COLD PACK</text>
 <path d="M 85 35 Q 100 25 115 35 L 118 78 Q 100 90 82 78 Z" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="80" y="38" width="40" height="20" rx="5" fill="#5DCAA5" opacity="0.4" stroke="#5DCAA5" stroke-width="2" stroke-dasharray="3,2"/>
 <text x="100" y="52" text-anchor="middle" fill="#5DCAA5" font-size="8">Cold pack</text>
 <text x="60" y="46" text-anchor="middle" fill="#5DCAA5" font-size="8">Bridge</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Item 6 , wrapped in cloth</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Helps slow blood vessels</text>` },
   { label: 'If still bleeding pinch 10 more minutes', svg: `<path d="M 85 38 Q 100 28 115 38 L 118 82 Q 100 92 82 82 Z" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="86" cy="74" rx="9" ry="6" fill="#E0D4C0" opacity="0.9"/><ellipse cx="114" cy="74" rx="9" ry="6" fill="#E0D4C0" opacity="0.9"/><line x1="74" y1="74" x2="83" y2="74" stroke="#5DCAA5" stroke-width="2.5"/><polygon points="81,71 86,74 81,77" fill="#5DCAA5"/><line x1="126" y1="74" x2="117" y2="74" stroke="#5DCAA5" stroke-width="2.5"/><polygon points="119,71 114,74 119,77" fill="#5DCAA5"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Keep pinching , don't release</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Pinch again for 10 more minutes if still bleeding</text>` },
  ],
  l2: [
   { label: 'Continue pinching', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">KEEP PINCHING</text>
 <path d="M 85 38 Q 100 28 115 38 L 118 82 Q 100 92 82 82 Z" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <ellipse cx="86" cy="74" rx="9" ry="6" fill="#E0D4C0" opacity="0.9"/>
 <ellipse cx="114" cy="74" rx="9" ry="6" fill="#E0D4C0" opacity="0.9"/>
 <line x1="74" y1="74" x2="83" y2="74" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="81,71 86,74 81,77" fill="#5DCAA5"/>
 <line x1="126" y1="74" x2="117" y2="74" stroke="#5DCAA5" stroke-width="2.5"/>
 <polygon points="119,71 114,74 119,77" fill="#5DCAA5"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Do not release pressure</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Sickbay/Med Assistant alerted</text>` },
   { label: 'Keep upright , do not tilt back', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">STAY UPRIGHT</text>
 <ellipse cx="100" cy="60" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="86" y="76" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Head forward , not back</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Blood down throat causes vomiting</text>` },
   { label: 'Watch for head injury signs', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#E65100" font-size="10" font-weight="bold" font-family="Arial">WATCH FOR CONCUSSION</text>
 <text x="55" y="70" text-anchor="middle" fill="#888780" font-size="10">Confusion</text>
 <text x="145" y="70" text-anchor="middle" fill="#888780" font-size="10">Dizzy</text>
 <text x="55" y="86" text-anchor="middle" fill="#888780" font-size="10">Unequal</text>
 <text x="55" y="96" text-anchor="middle" fill="#888780" font-size="10">pupils</text>
 <text x="145" y="86" text-anchor="middle" fill="#888780" font-size="10">Nausea</text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">After impact: check for concussion</text>` },
   { label: 'Sickbay/Med Assistant alerted concussion check', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="55" y="68" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Confusion</text><text x="145" y="68" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Dizzy</text><text x="55" y="85" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Unequal pupils</text><text x="145" y="85" text-anchor="middle" fill="#888780" font-size="10" font-family="Arial">Nausea</text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Watch for concussion signs</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Sickbay/Med Assistant alerted</text>` },
   { label: 'If faint lay flat head elevated', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Lay flat , head slightly elevated</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">If they feel faint</text>` },
  ],
  l3: [
   { label: 'Keep sitting upright', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">STAY UPRIGHT</text>
 <ellipse cx="100" cy="58" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="86" y="74" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Upright , do not lie down</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Emergency contacted</text>` },
   { label: 'If blood in throat , spit out', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">SPIT , DO NOT SWALLOW</text>
 <ellipse cx="100" cy="65" rx="24" ry="28" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <path d="M 88 78 Q 100 86 112 78" fill="none" stroke="#E0D4C0" stroke-width="2.5"/>
 <line x1="100" y1="86" x2="100" y2="105" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Spit blood out , never swallow</text>` },
   { label: 'Do not pack nostrils', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#990011" font-size="10" font-weight="bold" font-family="Arial">DO NOT PACK</text>
 <path d="M 85 38 Q 100 28 115 38 L 118 82 Q 100 92 82 82 Z" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <line x1="74" y1="34" x2="126" y2="86" stroke="#990011" stroke-width="3"/>
 <line x1="126" y1="34" x2="74" y2="86" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">No tissue, cotton or packing</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Causes damage when removed</text>` },
   { label: 'Emergency contacted', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="72" text-anchor="middle" fill="#990011" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Emergency contacted</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Keep upright , stay with them</text>` },
   { label: 'Stay with them keep calm', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="55" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="41" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Stay with them , keep calm</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Help is on the way</text>` },
  ],
  waiting: [
   { label: 'Stay upright', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">STAY UPRIGHT</text>
 <ellipse cx="100" cy="58" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <rect x="86" y="74" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Head forward , never back</text>` },
   { label: 'Spit blood out', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">SPIT , NOT SWALLOW</text>
 <text x="100" y="65" text-anchor="middle" fill="#FFEAA0" font-size="24"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Spit , never swallow blood</text>` },
   { label: 'No packing in nostrils', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">NO PACKING</text>
 <line x1="72" y1="40" x2="128" y2="96" stroke="#990011" stroke-width="3"/>
 <line x1="128" y1="40" x2="72" y2="96" stroke="#990011" stroke-width="3"/>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">No tissue or cotton inside nose</text>` },
   { label: 'Keep pressure on', svg: `<rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="15" text-anchor="middle" fill="#7A5200" font-size="10" font-weight="bold" font-family="Arial">KEEP PRESSURE</text>
 <text x="100" y="65" text-anchor="middle" fill="#5DCAA5" font-size="24"></text>
 <text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Pinch , do not release</text>
 <text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Clinic is coming</text>` },
   { label: 'If faint lay on side', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="28" cy="82" rx="18" ry="20" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="44" y="75" width="120" height="14" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><ellipse cx="176" cy="82" rx="14" ry="10" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">If faint , gently lay on side</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Head slightly elevated</text>` },
   { label: 'Calm anxiety worsens bleeding', svg: `<rect width="200" height="150" fill="#1C1C1A"/><ellipse cx="100" cy="62" rx="16" ry="18" fill="none" stroke="#E0D4C0" stroke-width="2"/><rect x="86" y="78" width="28" height="32" rx="7" fill="none" stroke="#E0D4C0" stroke-width="2"/><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Stay calm , anxiety worsens bleeding</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Breathe slowly</text>` },
   { label: 'Note time bleeding started', svg: `<rect width="200" height="150" fill="#1C1C1A"/><text x="100" y="68" text-anchor="middle" fill="#FFEAA0" font-size="28" font-family="Arial"></text><text x="100" y="140" text-anchor="middle" fill="#5DCAA5" font-size="10" font-family="Arial">Note time bleeding started</text><text x="100" y="148" text-anchor="middle" fill="#888780" font-size="8" font-family="Arial">Tell medical staff</text>` },
  ],
 },
};


// Default/idle animation shown when no situation selected
const ANIM_IDLE = `
 <rect width="200" height="150" fill="#1C1C1A"/>
 <text x="100" y="65" text-anchor="middle" fill="#333330" font-size="28" font-family="Arial"></text>
 <text x="100" y="90" text-anchor="middle" fill="#555552" font-size="11" font-family="Arial">Visual Guide</text>
 <text x="100" y="106" text-anchor="middle" fill="#444440" font-size="9" font-family="Arial">Syncs with each step</text>
`;

function showStepAnimation(situationKey, stepIndex, levelOverride) {
 var screenEl = document.getElementById('animScreen');
 var labelEl = document.getElementById('animStepLabel');
 // The screen may not be in the DOM yet on the very first paint of the
 // guidance screen; retry on the next frame instead of silently giving up
 // so the animation for step 1 never gets lost.
 if (!screenEl) {
  requestAnimationFrame(function() { showStepAnimation(situationKey, stepIndex, levelOverride); });
  return;
 }

 var situationAnims = STEP_ANIMATIONS[situationKey];
 var level = levelOverride || window._currentTriageLevel || 'l1';
 var anims = situationAnims ? (situationAnims[level] || situationAnims['l1'] || []): [];
 var frame = anims[stepIndex] || anims[anims.length - 1];

 screenEl.innerHTML =
  '<svg id="animSvg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" class="anim-fade-in">' +
  (frame ? frame.svg: ANIM_IDLE) +
  '</svg>';
 if (labelEl) labelEl.textContent = frame ? (frame.label || ''): '';
}

function showWaitingStepAnimation(situationKey, stepIndex) {
 // Show on the alert screen animation panel
 var wrap = document.getElementById('alertAnimWrap');
 var screenEl = document.getElementById('alertAnimScreen');
 var labelEl = document.getElementById('alertAnimLabel');
 if (!screenEl) {
  requestAnimationFrame(function() { showWaitingStepAnimation(situationKey, stepIndex); });
  return;
 }

 var situationAnims = STEP_ANIMATIONS[situationKey];
 var waiting = situationAnims ? situationAnims.waiting: null;
 // waiting can either be a flat array shared across l2/l3 (legacy format),
 // or an { l2: [...], l3: [...] } object with frames authored to match
 // each level's own waitingSteps text 1:1 in order. Level-aware data is
 // used when present so the frame shown always matches what's being read.
 var level = window._currentTriageLevel || 'l3';
 var anims = (waiting && !Array.isArray(waiting)) ? (waiting[level] || waiting['l3'] || []): (waiting || []);
 var frame = anims[stepIndex] || anims[anims.length - 1];

 if (wrap) wrap.classList.remove('hidden');

 screenEl.innerHTML =
  '<svg id="alertAnimSvg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" class="anim-fade-in">' +
  (frame ? frame.svg: ANIM_IDLE) +
  '</svg>';
 if (labelEl) labelEl.textContent = frame ? (frame.label || ''): '';
}

function resetAnimation() {
 var screen = document.getElementById('animScreen');
 if (screen) {
  screen.innerHTML = '<svg id="animSvg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">' + ANIM_IDLE + '</svg>';
 }
 var label = document.getElementById('animStepLabel');
 if (label) label.textContent = '';
}

// ── SITUATION METADATA & LOOKUP HELPERS ─────────────────────────────────
const SITUATION_ORDER = ['bleeding', 'burn', 'headache', 'fainting', 'allergic', 'sprain', 'eyeinjury', 'nosebleed'];
const SITUATION_META = {
 bleeding: { icon: "", priority: 2 },
 burn: { icon: "", priority: 2 },
 headache: { icon: "", priority: 4 },
 fainting: { icon: "", priority: 1 },
 allergic: { icon: "", priority: 1 },
 sprain: { icon: "", priority: 3 },
 eyeinjury: { icon: "", priority: 2 },
 nosebleed: { icon: "", priority: 3 }
};

function SITUATIONS() {
 const data = SITUATIONS_I18N[currentLang] || SITUATIONS_I18N.en;
 const merged = {};
 SITUATION_ORDER.forEach(function(key) {
  merged[key] = Object.assign({}, data[key], SITUATION_META[key]);
 });
 return merged;
}

// ── CORE APP STATE ───────────────────────────────────────────────────
let currentSituation = null;
let countdownInterval = null;
let activityLog = [];
let selectedVoice = null;
let customRecordings = {};
let hasUsedDevice = false;
let lastCheckedSeconds = 0;
let connIntervalId = null;

// ── SCREEN / STATUS UI HELPERS ──────────────────────────────────────────
function setLanguage(lang) {
 currentLang = lang;
 document.documentElement.lang = lang;
 ['en','fr','rw'].forEach(function(l) {
  document.getElementById('langBtn' + l.charAt(0).toUpperCase() + l.slice(1)).classList.toggle('active', l === lang);
 });

 document.getElementById('kitHeaderLabel').textContent = tr('kitHeaderLabel');
 document.getElementById('lidLabel').textContent = tr('lidLabel');
 document.getElementById('micPartName').textContent = tr('micPartName');
 document.getElementById('speakerPartName').textContent = tr('speakerPartName');
 document.getElementById('micLabel').textContent = tr('micLabel');
 document.getElementById('helpLabel').textContent = tr('helpLabel');
 document.getElementById('emergencyLabel').textContent = tr('emergencyLabel');
 document.getElementById('captionAssess').textContent = tr('captionAssess');
 document.getElementById('captionHelp').textContent = tr('captionHelp');
 document.getElementById('captionEmergency').textContent = tr('captionEmergency');
 document.getElementById('trayLabel').textContent = tr('trayLabel');
 document.getElementById('firstUseHint').innerHTML = tr('firstUseHint');
 document.getElementById('backLink1').textContent = tr('backLink');
 document.getElementById('backLink2').textContent = tr('backLink');
 document.getElementById('speakBtnLabel').textContent = tr('speakBtnLabel');
 document.getElementById('escalateNote').textContent = tr('escalateNote');
 document.getElementById('helpActionLabel').textContent = tr('helpActionLabel');
 document.getElementById('emergencyActionLabel').textContent = tr('emergencyActionLabel');
 document.getElementById('timerLabel').textContent = tr('timerLabel');
 document.getElementById('emergencyNowLabel').textContent = tr('emergencyNowLabel');
 document.getElementById('resetBtn').textContent = tr('resetBtn');
 document.getElementById('logLinkBtn').textContent = tr('logLinkBtn');
 document.getElementById('logPrompt').textContent = tr('logPrompt');
 document.getElementById('voiceSettingsSummary').textContent = tr('voiceSettingsSummary');
 document.getElementById('voiceSelectLabel').textContent = tr('voiceSelectLabel');
 document.getElementById('recordingUploadLabel').textContent = tr('recordingUploadLabel');
 document.getElementById('recordingHint').textContent = tr('recordingHint');

 if (!hasUsedDevice) document.getElementById('firstUseHint').classList.remove('hidden');

 buildOptions();
 if (currentSituation) {
  selectSituation(currentSituation);
 } else {
  document.getElementById('headerTitle').textContent = tr('headerHome');
 }
 populateBrowserVoices();
 setStatus(currentSituation ? tr('statusGuidance') + SITUATIONS()[currentSituation].label: tr('statusReady'), 'idle');
}

function confirmPress(btnId) {
 const btn = document.getElementById(btnId);
 if (!btn || btn.disabled) return;
 btn.classList.add('press-confirm');
 setTimeout(function() { btn.classList.remove('press-confirm'); }, 350);
}

function setStatus(text, mode) {
 mode = mode || 'idle';
 const dot = document.getElementById('statusDot');
 const label = document.getElementById('statusText');
 dot.className = 'status-dot' + (mode === 'busy' ? ' busy': mode === 'urgent' ? ' urgent': '');
 label.textContent = text;
}

function markDeviceUsed() {
 if (!hasUsedDevice) {
  hasUsedDevice = true;
  const hint = document.getElementById('firstUseHint');
  if (hint) hint.classList.add('hidden');
 }
}

function startConnectionClock() {
 lastCheckedSeconds = 0;
 updateConnText();
 clearInterval(connIntervalId);
 connIntervalId = setInterval(function() {
  lastCheckedSeconds += 1;
  updateConnText();
 }, 1000);
}

function updateConnText() {
 const el = document.getElementById('connIndicator');
 if (!el) return;
 const suffix = lastCheckedSeconds < 5 ? tr('connJustNow'): tr('connAgo', { s: lastCheckedSeconds });
 el.textContent = tr('connConnected') + suffix;
}

// ── VOICE RECOGNITION & FUZZY MATCHING (Assess button) ──────────────────
const SPEECH_LANG_MAP = { en: 'en-US', fr: 'fr-FR', rw: 'rw-RW' };

function startListening() {
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 const micBtn = document.getElementById('micBtn');
 const micStatus = document.getElementById('micStatus');

 if (!SpeechRecognition) {
  micStatus.textContent = tr('micUnsupported');
  micStatus.classList.remove('hidden');
  micStatus.classList.add('error');
  return;
 }

 const recognition = new SpeechRecognition();
 recognition.lang = SPEECH_LANG_MAP[currentLang] || 'en-US';
 recognition.interimResults = false;
 recognition.maxAlternatives = 1;

 micBtn.classList.add('listening');
 document.getElementById('micLabel').textContent = tr('micListening');
 micStatus.classList.remove('hidden', 'error');
 micStatus.textContent = tr('speakNow');
 markDeviceUsed();
 setStatus(tr('statusListening'), 'busy');

 recognition.onresult = function(event) {
  const transcript = event.results[0][0].transcript.toLowerCase();
  const result = matchSituation(transcript);
  const allMatches = result.exact.length > 0 ? result.exact: result.fuzzy;
  const wasFuzzy = result.exact.length === 0 && result.fuzzy.length > 0;

  if (allMatches.length === 0) {
   micStatus.textContent = tr('micNoMatch', { t: transcript });
   micStatus.classList.add('error');
   setStatus(tr('statusReady'), 'idle');
  } else {
   micStatus.textContent = tr('micHeard', { t: transcript });
   const data = SITUATIONS();
   const sorted = allMatches.slice().sort(function(a, b) { return data[a].priority - data[b].priority; });
   const first = sorted[0];
   const rest = sorted.slice(1);
   // Proceed immediately even on a fuzzy/uncertain match , in an emergency,
   // acting on a likely-correct guess beats stopping to ask the person to repeat themselves.
   // The guidance screen shows a "Did you mean X?" correction banner when the match was fuzzy.
   setTimeout(function() { showTriageScreen(first, rest, allMatches.length, wasFuzzy ? transcript: null); }, 500);
  }
 };

 recognition.onerror = function(event) {
  micStatus.textContent = tr('micError', { e: event.error });
  micStatus.classList.add('error');
  setStatus(tr('statusReady'), 'idle');
 };

 recognition.onend = function() {
  micBtn.classList.remove('listening');
  document.getElementById('micLabel').textContent = tr('micLabel');
 };

 recognition.start();
}

// ---- Fuzzy matching: tolerates mis-heard words like "breeding" for "bleeding" ----
// Levenshtein distance: counts how many single-letter edits separate two words.
function levenshtein(a, b) {
 const m = a.length, n = b.length;
 const d = Array.from({ length: m + 1 }, function() { return new Array(n + 1).fill(0); });
 for (let i = 0; i <= m; i++) d[i][0] = i;
 for (let j = 0; j <= n; j++) d[0][j] = j;
 for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
   if (a[i - 1] === b[j - 1]) {
    d[i][j] = d[i - 1][j - 1];
   } else {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1);
   }
  }
 }
 return d[m][n];
}

// Strips common English suffixes so inflections (burned, bleeding, sprained)
// reduce toward their root before spelling-distance is checked.
function stripSuffix(word) {
 return word.replace(/(ing|ed|es|s)$/i, '');
}

// A word "fuzzily matches" a keyword if it's close enough in spelling,
// scaled to keyword length so short words need near-exact matches and
// longer words tolerate one or two letter slips (exactly the "breeding"/"bleeding" case).
function isFuzzyMatch(word, keyword) {
 if (keyword.includes(' ')) return false; // skip multi-word keyword phrases for fuzzy check
 if (word === keyword) return true;
 const maxDistance = keyword.length <= 4 ? 1: keyword.length <= 7 ? 2: 3;
 if (levenshtein(word, keyword) <= maxDistance) return true;
 // Retry on root forms , catches "burned" vs "burn", "sprained" vs "sprain"
 const rootWord = stripSuffix(word), rootKeyword = stripSuffix(keyword);
 if (rootWord === rootKeyword) return true;
 return levenshtein(rootWord, rootKeyword) <= maxDistance;
}

function matchSituation(transcript) {
 const exactMatches = [];
 const fuzzyMatches = [];
 const data = SITUATIONS();
 const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);

 Object.keys(data).forEach(function(key) {
  const s = data[key];
  if (!s.keywords) return;

  // Exact substring match first (handles multi-word phrases too, e.g. "passed out")
  const hasExact = s.keywords.some(function(kw) { return transcript.includes(kw); });
  if (hasExact) {
   exactMatches.push(key);
   return;
  }

  // Fall back to fuzzy, word-by-word matching against single-word keywords
  const hasFuzzy = s.keywords.some(function(kw) {
   return words.some(function(w) { return isFuzzyMatch(w, kw); });
  });
  if (hasFuzzy) fuzzyMatches.push(key);
 });

 return { exact: exactMatches, fuzzy: fuzzyMatches };
}

function buildOptions() {
 const grid = document.getElementById('optionsGrid');
 grid.innerHTML = '';
 const data = SITUATIONS();
 SITUATION_ORDER.forEach(function(key) {
  const s = data[key];
  const btn = document.createElement('button');
  btn.className = 'tray-item';
  btn.innerHTML = '<span class="tray-item-icon">' + s.icon + '</span>' +
   '<span class="tray-item-text">' +
   '<span class="tray-item-name">' + s.label + '</span>' +
   '<span class="tray-item-sub">' + (s.itemHint || '') + '</span>' +
   '</span>';
  btn.onclick = function() { markDeviceUsed(); showTriageScreen(key); };
  grid.appendChild(btn);
 });
}

// ── TRIAGE FLOW ─────────────────────────────────────────────────────────
// After a situation is identified, route through triage before guidance.
// This replaces direct calls to selectSituation from the speech/button flow.

var currentTriageKey = null;
var currentTriageQueue = [];
var currentTriageTotalMentioned = 1;
var currentTriageFuzzy = null;

function showTriageScreen(key, queue, totalMentioned, fuzzyTranscript) {
 currentTriageKey = key;
 currentTriageQueue = queue || [];
 currentTriageTotalMentioned = totalMentioned || 1;
 currentTriageFuzzy = fuzzyTranscript || null;

 var data = SITUATIONS();
 var s = data[key];
 var triageData = TRIAGE[currentLang] && TRIAGE[currentLang].situations[key]
  ? TRIAGE[currentLang].situations[key]
  : TRIAGE.en.situations[key];
 var levels = TRIAGE[currentLang] ? TRIAGE[currentLang].levels: TRIAGE.en.levels;

 // Set the situation tag and question text on screen
 document.getElementById('triageSituationTag').textContent = (s.icon || '') + ' ' + s.label;
 document.getElementById('triageQuestion').textContent = triageData.question;

 // Reset listening UI
 document.getElementById('triageListenBox').classList.remove('hidden');
 document.getElementById('triageHeardBox').classList.add('hidden');
 document.getElementById('triageFallback').classList.add('hidden');
 document.getElementById('triageListenLabel').textContent = 'Listening...';

 // Build fallback tap buttons (hidden unless voice fails)
 var opts = document.getElementById('triageOptions');
 opts.innerHTML = '';
 [
  { level: 'l1', cls: 'triage-l1', emoji: '' },
  { level: 'l2', cls: 'triage-l2', emoji: '' },
  { level: 'l3', cls: 'triage-l3', emoji: '' }
 ].forEach(function(item) {
  var ld = triageData[item.level];
  var btn = document.createElement('button');
  btn.className = 'triage-btn ' + item.cls;
  btn.innerHTML =
   '<span class="triage-btn-level">' + item.emoji + '</span>' +
   '<span class="triage-btn-content">' +
    '<span class="triage-btn-label">' + levels[item.level] + ' , ' + ld.label + '</span>' +
    '<span class="triage-btn-desc">' + ld.desc + '</span>' +
   '</span>';
  btn.onclick = (function(lv) {
   return function() { handleTriageSelection(key, lv); };
  })(item.level);
  opts.appendChild(btn);
 });

 showScreen('triageScreen');
 setStatus('Assessing: ' + s.label, 'idle');

 // Speak the triage question, then start listening for minor / moderate / severe
 var questionText = triageData.question + ' Say minor, moderate, or severe.';
 speakThenListen(questionText, function(transcript) {
  var level = matchTriageLevel(transcript);
  if (level) {
   // Show what was heard
   var levelNames = { l1: 'Minor', l2: 'Moderate', l3: 'Severe' };
   document.getElementById('triageListenBox').classList.add('hidden');
   var heardBox = document.getElementById('triageHeardBox');
   heardBox.classList.remove('hidden');
   document.getElementById('triageHeardText').textContent =
    'Heard: "' + transcript + '" → ' + levelNames[level];
   // Small pause then act
   setTimeout(function() { handleTriageSelection(key, level); }, 700);
  } else {
   // Did not understand , show fallback buttons and try again once
   document.getElementById('triageListenLabel').textContent = 'Say "minor", "moderate", or "severe"';
   speakThenListen('Sorry, say minor, moderate, or severe.', function(t2) {
    var l2 = matchTriageLevel(t2);
    if (l2) {
     var levelNames2 = { l1: 'Minor', l2: 'Moderate', l3: 'Severe' };
     document.getElementById('triageListenBox').classList.add('hidden');
     var hb = document.getElementById('triageHeardBox');
     hb.classList.remove('hidden');
     document.getElementById('triageHeardText').textContent =
      'Heard: "' + t2 + '" → ' + levelNames2[l2];
     setTimeout(function() { handleTriageSelection(key, l2); }, 700);
    } else {
     // Two failed attempts , show tap fallback
     document.getElementById('triageListenBox').classList.add('hidden');
     document.getElementById('triageFallback').classList.remove('hidden');
    }
   });
  }
 });
}

// Speak text, then start listening immediately when finished
var triageRecognition = null;
function speakThenListen(text, callback) {
 // Route through _speakOne so ElevenLabs voice works for triage questions too
 _speakOne(text, function() {
  startTriageListening(callback);
 });
}

function startTriageListening(callback) {
 if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
  document.getElementById('triageFallback').classList.remove('hidden');
  return;
 }
 var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
 triageRecognition = new SR();
 triageRecognition.lang = currentLang === 'rw' ? 'rw-RW': currentLang === 'fr' ? 'fr-FR': 'en-US';
 triageRecognition.interimResults = false;
 triageRecognition.maxAlternatives = 3;
 triageRecognition.onresult = function(event) {
  // Check all alternatives for a severity match
  var matched = null;
  for (var i = 0; i < event.results[0].length; i++) {
   var t = event.results[0][i].transcript.toLowerCase();
   var lv = matchTriageLevel(t);
   if (lv) { matched = { transcript: t, level: lv }; break; }
  }
  if (matched) {
   callback(matched.transcript);
  } else {
   callback(event.results[0][0].transcript.toLowerCase());
  }
 };
 triageRecognition.onerror = function() {
  document.getElementById('triageListenBox').classList.add('hidden');
  document.getElementById('triageFallback').classList.remove('hidden');
 };
 triageRecognition.start();
}

// Match a spoken answer to l1/l2/l3
// Accepts: minor / moderate / severe + common variations and FR/RW equivalents
function matchTriageLevel(transcript) {
 var t = transcript.toLowerCase();
 // Minor keywords (EN + FR + RW)
 if (/\b(minor|small|little|mild|light|okay|fine|not bad|byoroheje|léger|légère|peu grave|petit)\b/.test(t)) return 'l1';
 // Severe keywords , check before moderate (EN + FR + RW: bikaze=very serious, cyane=very much)
 if (/\b(severe|serious|very bad|critical|emergency|bad|worst|danger|bikaze|cyane|grave|très grave|urgence)\b/.test(t)) return 'l3';
 // Moderate keywords (EN + FR + RW: bigifite=has consequences, biringanye=balanced/medium)
 if (/\b(moderate|medium|middle|between|average|bigifite|biringanye|modéré|modérée|moyen|assez)\b/.test(t)) return 'l2';
 return null;
}

function handleTriageSelection(key, level) {
 var triageData = TRIAGE[currentLang] && TRIAGE[currentLang].situations[key]
  ? TRIAGE[currentLang].situations[key]
  : TRIAGE.en.situations[key];
 var ld = triageData[level];

 // Always store current triage level data globally so alert screens can access it
 window._currentTriageLevelData = ld;
 window._currentTriageKey = key;
 window._currentTriageLevel = level; // 'l1', 'l2', or 'l3'

 // ── AUTO STOCK DEDUCTION ─────────────────────────────────────────
 // Fires automatically the moment severity is confirmed , no human action needed
 autoDeductStock(key, level);

 // Level 3 with autoAction='emergency' , skip guidance, fire emergency immediately
 if (level === 'l3' && ld.autoAction === 'emergency') {
  currentSituation = key;
  document.getElementById('helpBtn').disabled = false;
  document.getElementById('emergencyBtn').disabled = false;
  alertClinic('triage-severe');
  return;
 }

 // Level 2 with autoAction='faculty' , show guidance AND auto-alert faculty after 1s
 if (level === 'l2' && ld.autoAction === 'faculty') {
  window._triageSpeak = ld.speak; window._triageSteps = ld.steps || null;
  selectSituation(key, currentTriageQueue, currentTriageTotalMentioned, currentTriageFuzzy, level);
  setTimeout(function() { alertFaculty(); }, 1200);
  return;
 }

 // Level 1 , just show guidance
 window._triageSpeak = ld ? ld.speak: null; window._triageSteps = ld ? (ld.steps || null): null;
 selectSituation(key, currentTriageQueue, currentTriageTotalMentioned, currentTriageFuzzy, level);
}

function selectSituation(key, queue, totalMentioned, fuzzyTranscript, triageLevel) {
 queue = queue || [];
 totalMentioned = totalMentioned || 1;
 currentSituation = key;
 const data = SITUATIONS();
 const s = data[key];

 // Use triage-level guidance if a level was selected
 var triageSteps = null, triageSpeak = null, triageUrgency = null;
 if (triageLevel && TRIAGE[currentLang] && TRIAGE[currentLang].situations[key]) {
  var ld = TRIAGE[currentLang].situations[key][triageLevel] || TRIAGE.en.situations[key][triageLevel];
  if (ld) {
   triageSteps = ld.steps;
   triageSpeak = ld.speak;
   triageUrgency = triageLevel === 'l3' ? 'urgent': triageLevel === 'l2' ? 'soon': 'calm';
  }
 }

 document.getElementById('helpBtn').disabled = false;
 document.getElementById('emergencyBtn').disabled = false;
 setStatus(tr('statusGuidance') + s.label, s.priority === 1 ? 'urgent': 'idle');

 // "Did you mean X?" correction banner , shown only when the voice match was a fuzzy guess,
 // so the person can fix it in one tap without having to repeat themselves under stress.
 const correctionBox = document.getElementById('correctionBanner');
 if (fuzzyTranscript) {
  correctionBox.innerHTML = '';
  const msg = document.createElement('span');
  msg.textContent = tr('didYouMean', { t: fuzzyTranscript, label: s.label });
  correctionBox.appendChild(msg);
  const otherKeys = SITUATION_ORDER.filter(function(k) { return k !== key; });
  const notThisBtn = document.createElement('button');
  notThisBtn.className = 'correction-not-this';
  notThisBtn.textContent = tr('notThis');
  notThisBtn.onclick = function() { showCorrectionPicker(otherKeys); };
  correctionBox.appendChild(notThisBtn);
  correctionBox.classList.remove('hidden');
 } else {
  correctionBox.classList.add('hidden');
 }

 const summaryBox = document.getElementById('multiSummary');
 if (totalMentioned > 1) {
  const queueLabels = queue.map(function(k) { return data[k].label; }).join(', ');
  summaryBox.textContent = tr('multiSummary', { n: totalMentioned, first: s.label.toLowerCase(), rest: queueLabels });
  summaryBox.classList.remove('hidden');
 } else {
  summaryBox.classList.add('hidden');
 }

 document.getElementById('situationTag').textContent = s.label;
 document.getElementById('logTimestamp').textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

 const urgencyEl = document.getElementById('urgencyNote');
 if (triageUrgency) {
  const urgencyLabels = { urgent: ' Severe , emergency response activated', soon: ' Moderate , Sickbay/Med Assistant has been alerted', calm: ' Minor , follow the steps below' };
  urgencyEl.textContent = urgencyLabels[triageUrgency] || '';
  urgencyEl.className = 'urgency-note ' + triageUrgency;
  urgencyEl.classList.remove('hidden');
 } else if (s.urgencyNote) {
  urgencyEl.textContent = s.urgencyNote;
  urgencyEl.className = 'urgency-note ' + (s.priority === 1 ? 'urgent': s.priority === 4 ? 'calm': 'soon');
  urgencyEl.classList.remove('hidden');
 } else {
  urgencyEl.classList.add('hidden');
 }

 document.getElementById('guidanceIntro').textContent = s.intro;
 const list = document.getElementById('stepsList');
 list.innerHTML = '';
 var stepsToShow = triageSteps || s.steps;
 stepsToShow.forEach(function(step, i) {
  const li = document.createElement('li');
  li.setAttribute('data-n', i + 1);
  li.textContent = step;
  // Clicking a step shows its animation frame
  li.style.cursor = 'pointer';
  li.onclick = (function(idx) {
   return function() { showStepAnimation(key, idx); };
  })(i);
  list.appendChild(li);
 });
 // Show first step animation immediately
 showStepAnimation(key, 0);

 const queueBox = document.getElementById('queueBox');
 if (queue.length > 0) {
  queueBox.innerHTML = '<div class="queue-label">' + tr('queueUpNext') + '</div>';
  queue.forEach(function(k) {
   const qs = data[k];
   const btn = document.createElement('button');
   btn.className = 'queue-item';
   btn.innerHTML = qs.icon + ' ' + qs.label;
   const remaining = queue.filter(function(q) { return q !== k; });
   btn.onclick = function() { selectSituation(k, remaining, remaining.length + 1); };
   queueBox.appendChild(btn);
  });
  queueBox.classList.remove('hidden');
 } else {
  queueBox.classList.add('hidden');
 }

 showScreen('guidanceScreen');
 document.getElementById('headerTitle').textContent = tr('headerGuide');

 // ── AUTO-SPEAK ───────────────────────────────────────────────────
 // Start reading steps immediately , no button press needed.
 // Small delay lets the screen transition complete first.
 setTimeout(function() { speakGuidance(); }, 600);

 activityLog.unshift({ time: new Date().toLocaleTimeString(), event: tr('logAssessed') + s.label });
}

function showCorrectionPicker(otherKeys) {
 const data = SITUATIONS();
 const correctionBox = document.getElementById('correctionBanner');
 correctionBox.innerHTML = '';
 const label = document.createElement('div');
 label.className = 'correction-picker-label';
 label.textContent = tr('pickCorrect');
 correctionBox.appendChild(label);
 const grid = document.createElement('div');
 grid.className = 'correction-picker-grid';
 otherKeys.forEach(function(k) {
  const s = data[k];
  const btn = document.createElement('button');
  btn.className = 'correction-picker-btn';
  btn.innerHTML = s.icon + ' ' + s.label;
  btn.onclick = function() { selectSituation(k); };
  grid.appendChild(btn);
 });
 correctionBox.appendChild(grid);
}

// ── RELIABLE SEQUENTIAL SPEECH ENGINE ────────────────────────────────
// Speaks a list of texts one by one. After each utterance, waits for
// Chrome's speech engine to truly finish before starting the next.
// Uses a keepAlive ping to prevent Chrome silently stopping long queues.
var _speechQueue = [];
var _speechActive = false;
var _keepAliveTimer = null;

function _startKeepAlive() {
 _stopKeepAlive();
 // keepAlive ping only needed for Web Speech API , not for ElevenLabs
 if (_voiceEngine === 'eleven') return;
 _keepAliveTimer = setInterval(function() {
  if (window.speechSynthesis.speaking) {
   window.speechSynthesis.pause();
   window.speechSynthesis.resume();
  }
 }, 5000);
}

function _stopKeepAlive() {
 if (_keepAliveTimer) { clearInterval(_keepAliveTimer); _keepAliveTimer = null; }
}

function _speakQueue(items, onEachStart, onDone) {
 // items: [{text, repeatTimes}], onEachStart(index), onDone()
 _speechQueue = [];
 _speechActive = false;
 // Only cancel Web Speech if we are in browser mode
 if (_voiceEngine !== 'eleven') {
  window.speechSynthesis.cancel();
 }
 _startKeepAlive();

 var expanded = [];
 items.forEach(function(item) {
  var times = item.repeatTimes || 1;
  for (var t = 0; t < times; t++) {
   expanded.push({ text: item.text, originalIndex: item.index, isRepeat: t > 0 });
  }
 });

 var pos = 0;

 function speakNext() {
  if (pos >= expanded.length) {
   _stopKeepAlive();
   _speechActive = false;
   if (onDone) onDone();
   return;
  }
  var item = expanded[pos];
  pos++;

  // Only trigger onEachStart on first read (not repeat)
  if (!item.isRepeat && onEachStart) {
   onEachStart(item.originalIndex);
  }

  // Route through unified voice engine (_speakOne handles eleven/browser/recorded)
  _speakOne(item.text, function() {
   speakNext();
  });
  _speechActive = true;
 }

 speakNext();
}

function speakGuidance() {
 if (!currentSituation) return;
 var s = SITUATIONS()[currentSituation];
 if (!s) return;

 // Hide done banner when replaying , it will reappear when done
 hideGuidanceDoneBanner();

 if (typeof customRecordings !== 'undefined' && customRecordings[currentSituation]) {
  var player = document.getElementById('audioPlayer');
  if (player) { player.src = customRecordings[currentSituation]; player.play(); }
  return;
 }

 var stepsToSpeak = (typeof window._triageSteps !== 'undefined' && window._triageSteps) || s.steps || [];
 var level = window._currentTriageLevel || 'l1';
 var key = currentSituation;

 var listItems = Array.from(document.getElementById('stepsList').querySelectorAll('li'));

 function clearHighlights() {
  listItems.forEach(function(li) { li.style.background = ''; li.style.fontWeight = ''; li.style.color = ''; });
 }

 // Build items: opener first, then each step , every step read TWICE
 var items = [{ text: (s.intro || 'Here is what to do.'), index: -1, repeatTimes: 1 }];
 stepsToSpeak.forEach(function(step, i) {
  items.push({ text: 'Step ' + (i + 1) + '. ' + step, index: i, repeatTimes: 2 });
 });

 _speakQueue(items, function(idx) {
  // Called at start of each item (not repeats)
  clearHighlights();
  if (idx >= 0) {
   if (listItems[idx]) {
    listItems[idx].style.background = '#F5E6E6';
    listItems[idx].style.fontWeight = '700';
    listItems[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
   }
   showStepAnimation(key, idx, level);
  }
 }, function() {
  clearHighlights();
  // ── GUIDANCE COMPLETE ─────────────────────────────────────────
  // Steps stay visible. Show done banner and restock notice inline.
  // Person can replay anytime , screen never leaves until they choose.
  markAllStepsDone();
  setTimeout(function() {
   showGuidanceDoneBanner();
   showGuidanceRestockBanner(key, level);
   // Ask if user wants to repeat the steps
   askToRepeatSteps();
  }, 800);
 });
}

const LANG_VOICE_HINTS = {
 en: ['nigeria','south africa','kenya','ghana','en-ng','en-za','en-ke','en-gh','en-'],
 fr: ['fr-fr','fr-ca','fr-'],
 rw: ['rw-rw','rw-','kinyarwanda','swahili']
};

// NOTE: voice listing/selection is handled entirely by populateBrowserVoices()
// and setBrowserVoice() further down (── Browser voice list ── section).
// There used to be a second, separate implementation here (loadVoices(),
// wired to the legacy #voiceSelect dropdown) that raced with it for the
// speechSynthesis.onvoiceschanged handler and reset the user's chosen voice
// back to a "best guess" every time the voice list reloaded, so a voice
// picked from #voiceSelect would silently stop applying. It has been
// removed; #voiceSelect is now just a second view onto the same
// populateBrowserVoices()/setBrowserVoice() state as #browserVoiceSelect.

document.getElementById('recordingUpload').addEventListener('change', function(e) {
 const files = Array.from(e.target.files);
 files.forEach(function(file, i) {
  const key = SITUATION_ORDER[i];
  if (key) customRecordings[key] = URL.createObjectURL(file);
 });
 if (files.length > 0) {
  const data = SITUATIONS();
  const list = SITUATION_ORDER.slice(0, files.length).map(function(k) { return data[k].label; }).join(', ');
  alert(tr('recordingLoaded', { n: files.length, list: list }));
 }
});


// ══ VOICE ENGINE SYSTEM ═════════════════════════════════════════════
// Three modes:
//  'browser' , Web Speech Synthesis API (default, uses device voices)
//  'eleven'  , ElevenLabs AI API (African English accent, needs API key)
//  'recorded' , Pre-recorded audio files (for physical hardware device)

var _voiceEngine = localStorage.getItem('smartaid_voice_engine') || 'browser';
var _elevenApiKey = localStorage.getItem('smartaid_eleven_key') || '';
var _elevenVoiceId = localStorage.getItem('smartaid_eleven_voice') || 'pMsXgVXv3BLzUgSXRplE';
var _elevenCache = {}; // cache audio blobs by text to avoid re-fetching

function toggleVoicePanel() {
 var panel = document.getElementById('voicePanel');
 if (panel) panel.classList.toggle('open');
}

function selectVoiceEngine(engine) {
 _voiceEngine = engine;
 localStorage.setItem('smartaid_voice_engine', engine);

 // Update selected state
 ['eleven','browser','recorded'].forEach(function(e) {
  var row = document.getElementById('voiceOpt_' + e);
  if (row) row.classList.toggle('selected', e === engine);
 });

 // Show/hide settings sections
 var apiSection = document.getElementById('voiceApiSection');
 var browserSection = document.getElementById('voiceBrowserSection');
 if (apiSection) apiSection.style.display = engine === 'eleven' ? 'block': 'none';
 if (browserSection) browserSection.style.display = engine === 'browser' ? 'block': 'none';

 // Update label
 var label = document.getElementById('voiceActiveLabel');
 if (label) {
  var labels = { eleven: 'ElevenLabs AI', browser: 'Browser voice', recorded: 'Pre-recorded' };
  label.textContent = labels[engine] || engine;
 }
}

function updateElevenKey(key) {
 _elevenApiKey = key.trim();
 localStorage.setItem('smartaid_eleven_key', _elevenApiKey);
}

function updateElevenVoice(voiceId) {
 _elevenVoiceId = voiceId;
 localStorage.setItem('smartaid_eleven_voice', voiceId);
 _elevenCache = {}; // clear cache when voice changes
}

function saveVoiceSettings() {
 selectVoiceEngine(_voiceEngine);
 var panel = document.getElementById('voicePanel');
 if (panel) panel.classList.remove('open');
}

// ── ElevenLabs speech ─────────────────────────────────────────────────
function _showElevenError(message) {
 var note = document.getElementById('elevenErrorNote');
 if (!note) return;
 if (!message) {
  note.classList.add('hidden');
  note.textContent = '';
  return;
 }
 note.textContent = ' ' + message + ' , using browser voice instead.';
 note.classList.remove('hidden');
}

function _speakElevenLabs(text, onDone) {
 if (!_elevenApiKey) {
  _showElevenError('No ElevenLabs API key set');
  _speakBrowserSingle(text, onDone);
  return;
 }

 // Check cache first
 if (_elevenCache[text]) {
  _showElevenError(null);
  _playAudioBlob(_elevenCache[text], onDone);
  return;
 }

 var url = 'https://api.elevenlabs.io/v1/text-to-speech/' + _elevenVoiceId + '/stream';
 var body = JSON.stringify({
  text: text,
  model_id: 'eleven_multilingual_v2',
  voice_settings: {
   stability: 0.65,
   similarity_boost: 0.80,
   style: 0.25,
   use_speaker_boost: true
  }
 });

 fetch(url, {
  method: 'POST',
  headers: {
   'xi-api-key': _elevenApiKey,
   'Content-Type': 'application/json',
   'Accept': 'audio/mpeg'
  },
  body: body
 })
 .then(function(res) {
  if (!res.ok) {
   var statusMessages = {
    401: 'Invalid ElevenLabs API key',
    403: 'ElevenLabs API key not authorised for this voice',
    429: 'ElevenLabs free-tier limit reached'
   };
   var err = new Error(statusMessages[res.status] || ('ElevenLabs API error (' + res.status + ')'));
   err.status = res.status;
   throw err;
  }
  return res.blob();
 })
 .then(function(blob) {
  _showElevenError(null);
  _elevenCache[text] = blob;
  _playAudioBlob(blob, onDone);
 })
 .catch(function(err) {
  console.warn('ElevenLabs failed:', err.message, ', falling back to browser TTS');
  _showElevenError(err.message || 'ElevenLabs request failed');
  _speakBrowserSingle(text, onDone);
 });
}

function _playAudioBlob(blob, onDone) {
 var url = URL.createObjectURL(blob);
 var audio = new Audio(url);
 audio.onended = function() {
  URL.revokeObjectURL(url);
  setTimeout(onDone, 350);
 };
 audio.onerror = function() {
  URL.revokeObjectURL(url);
  setTimeout(onDone, 300);
 };
 audio.play().catch(function() { setTimeout(onDone, 300); });
}

// ── Browser TTS single utterance ──────────────────────────────────────
function _speakBrowserSingle(text, onDone) {
 if (!('speechSynthesis' in window)) { setTimeout(onDone, 300); return; }
 var utter = new SpeechSynthesisUtterance(text);
 utter.rate = 0.88;
 utter.pitch = 1.0;

 // Priority: use voice from new voice selector UI, then fall back to selectedVoice
 var voices = window.speechSynthesis.getVoices();
 var savedVoiceName = localStorage.getItem('smartaid_browser_voice');
 var chosenVoice = null;

 if (savedVoiceName) {
  // User explicitly chose a voice in our settings , use it
  chosenVoice = voices.find(function(v) { return v.name === savedVoiceName; }) || null;
 }

 if (!chosenVoice && typeof selectedVoice !== 'undefined' && selectedVoice) {
  // Fall back to auto-selected voice from language detection
  chosenVoice = selectedVoice;
 }

 if (!chosenVoice) {
  // Last resort: find best African English voice available
  var africanPref = ['en-NG','en-ZA','en-KE','en-GH','en-TZ'];
  for (var i = 0; i < africanPref.length; i++) {
   chosenVoice = voices.find(function(v) { return v.lang === africanPref[i]; }) || null;
   if (chosenVoice) break;
  }
 }

 if (chosenVoice) utter.voice = chosenVoice;
 utter.onend = function() { setTimeout(onDone, 480); };
 utter.onerror = function() { setTimeout(onDone, 300); };
 window.speechSynthesis.speak(utter);
}

// ── Unified speak one ─────────────────────────────────────────────────
// This replaces the per-utterance call inside _speakQueue
function _speakOne(text, onDone) {
 if (_voiceEngine === 'eleven' && _elevenApiKey) {
  _speakElevenLabs(text, onDone);
 } else {
  _speakBrowserSingle(text, onDone);
 }
}

// ── Test functions ────────────────────────────────────────────────────
function testElevenVoice() {
 var voiceSelect = document.getElementById('elevenVoiceId');
 var voiceName = voiceSelect ? voiceSelect.options[voiceSelect.selectedIndex].text.split(' , ')[0]: 'this voice';
 _speakElevenLabs(
  'SmartAid Kit. This is ' + voiceName + '. I am your voice-guided first aid assistant. Press Assess and speak your emergency.',
  function() { console.log('Test complete'); }
 );
}

function testBrowserVoice() {
 _speakBrowserSingle(
  'SmartAid Kit. Your voice guide is ready. Press Assess and speak your emergency.',
  function() { console.log('Test complete'); }
 );
}

// ── Browser voice list ────────────────────────────────────────────────
// Single source of truth for voice listing/selection. Drives BOTH the
// grouped picker in the Voice settings panel (#browserVoiceSelect) and the
// plain "System voice" dropdown at the bottom of the page (#voiceSelect) ,
// so no matter which control the person uses, the choice is the same
// underlying state (persisted to localStorage via setBrowserVoice).
function populateBrowserVoices() {
 var select = document.getElementById('browserVoiceSelect');
 var legacySelect = document.getElementById('voiceSelect');
 if ((!select && !legacySelect) || !('speechSynthesis' in window)) return;

 var voices = window.speechSynthesis.getVoices();
 if (voices.length === 0) return;

 // Sort: African voices first, then other English, then rest
 var african = voices.filter(function(v) {
  return /en-NG|en-ZA|en-KE|en-GH|en-TZ|en-RW|nigeria|south africa|kenya|ghana|african/i.test(v.lang + ' ' + v.name);
 });
 var otherEn = voices.filter(function(v) {
  return v.lang.startsWith('en') && !african.includes(v);
 });
 var rest = voices.filter(function(v) {
  return !v.lang.startsWith('en');
 });

 var sorted = african.concat(otherEn).concat(rest);

 if (select) {
  select.innerHTML = '';
  if (african.length > 0) {
   var grp1 = document.createElement('optgroup');
   grp1.label = ' African English voices';
   african.forEach(function(v) {
    var opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = v.name + ' (' + v.lang + ')';
    grp1.appendChild(opt);
   });
   select.appendChild(grp1);
  }

  var grp2 = document.createElement('optgroup');
  grp2.label = ' Other English voices';
  otherEn.forEach(function(v) {
   var opt = document.createElement('option');
   opt.value = v.name;
   opt.textContent = v.name + ' (' + v.lang + ')';
   grp2.appendChild(opt);
  });
  select.appendChild(grp2);

  if (rest.length > 0) {
   var grp3 = document.createElement('optgroup');
   grp3.label = ' Other languages';
   rest.forEach(function(v) {
    var opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = v.name + ' (' + v.lang + ')';
    grp3.appendChild(opt);
   });
   select.appendChild(grp3);
  }
 }

 if (legacySelect) {
  legacySelect.innerHTML = '';
  sorted.forEach(function(v) {
   var opt = document.createElement('option');
   opt.value = v.name;
   opt.textContent = v.name + ' (' + v.lang + ')';
   legacySelect.appendChild(opt);
  });
 }

 // Restore saved selection , or fall back to the best language-appropriate
 // guess (without persisting it, so we don't lock in a choice the person
 // never actually made).
 var saved = localStorage.getItem('smartaid_browser_voice');
 var chosenName = saved;
 if (!chosenName) {
  var hints = LANG_VOICE_HINTS[currentLang] || LANG_VOICE_HINTS.en;
  var guess = sorted.slice().sort(function(a, b) {
   var aMatch = hints.some(function(h) { return (a.name + a.lang).toLowerCase().indexOf(h) !== -1; }) ? 0: 1;
   var bMatch = hints.some(function(h) { return (b.name + b.lang).toLowerCase().indexOf(h) !== -1; }) ? 0: 1;
   return aMatch - bMatch;
  })[0];
  chosenName = guess ? guess.name: null;
 }
 if (chosenName) {
  if (select) select.value = chosenName;
  if (legacySelect) legacySelect.value = chosenName;
  var match = voices.find(function(v) { return v.name === chosenName; });
  if (match && typeof selectedVoice !== 'undefined') selectedVoice = match;
 }

 // Kinyarwanda fallback note , shown when no native Kinyarwanda voice
 // is installed on this device.
 var fallbackNote = document.getElementById('voiceFallbackNote');
 if (fallbackNote) {
  if (currentLang === 'rw') {
   var hasRwVoice = voices.some(function(v) { return (v.lang || '').toLowerCase().indexOf('rw') === 0; });
   fallbackNote.classList.toggle('hidden', hasRwVoice);
   fallbackNote.textContent = tr('voiceFallbackNote');
  } else {
   fallbackNote.classList.add('hidden');
  }
 }

 // Show active voice label
 var label = document.getElementById('voiceActiveLabel');
 if (label && _voiceEngine === 'browser') {
  var activeName = saved || chosenName;
  var activeVoice = voices.find(function(v) { return v.name === activeName; });
  label.textContent = activeVoice ? activeVoice.name + ' (' + activeVoice.lang + ')': 'Browser voice';
 }
}

function setBrowserVoice(name) {
 localStorage.setItem('smartaid_browser_voice', name);
 var voices = window.speechSynthesis ? window.speechSynthesis.getVoices(): [];
 var match = voices.find(function(v) { return v.name === name; });
 if (match && typeof selectedVoice !== 'undefined') {
  selectedVoice = match;
  var label = document.getElementById('voiceActiveLabel');
  if (label) label.textContent = name + ' (' + match.lang + ')';
 }
 // Keep both selectors in sync regardless of which one triggered the change
 var select = document.getElementById('browserVoiceSelect');
 var legacySelect = document.getElementById('voiceSelect');
 if (select && select.value !== name) select.value = name;
 if (legacySelect && legacySelect.value !== name) legacySelect.value = name;
}

// Populate voices when they load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
 window.speechSynthesis.onvoiceschanged = populateBrowserVoices;
 setTimeout(populateBrowserVoices, 500);
}

// ── Init voice engine on load ─────────────────────────────────────────
// NOTE: this script is injected via next/script's afterInteractive strategy,
// which loads well after the document's native DOMContentLoaded has already
// fired. A DOMContentLoaded listener registered here would never run, so we
// use _onDomReady, which fires immediately if the DOM is already ready.
_onDomReady(function() {
 selectVoiceEngine(_voiceEngine);
 // Restore ElevenLabs key if saved
 var keyEl = document.getElementById('elevenApiKey');
 if (keyEl && _elevenApiKey) keyEl.value = _elevenApiKey;
 var voiceEl = document.getElementById('elevenVoiceId');
 if (voiceEl && _elevenVoiceId) voiceEl.value = _elevenVoiceId;
});


// ══ STOCK TRACKING ENGINE ═══════════════════════════════════════════
// Tracks kit item quantities. Auto-deducts when guidance fires.
// Administrator sets starting quantities via Setup screen.
// Only alerts when stock drops to threshold , not on first use.

const KIT_ITEMS = {
 // consumable: true = single use, deducted from stock after each emergency
 // consumable: false = reusable, clean and return to kit , never deducted
 1: { name: 'Bandages (assorted)',    icon: '', defaultQty: 5, consumable: true, note: 'Single use , replace after each use' },
 2: { name: 'Elastic bandage',      icon: '', defaultQty: 2, consumable: false, note: 'Reusable , wash and return to kit' },
 3: { name: 'Sterile gauze',       icon: '⬜', defaultQty: 4, consumable: true, note: 'Single use , replace after each use' },
 4: { name: 'Non-stick sterile gauze',  icon: '⬜', defaultQty: 3, consumable: true, note: 'Single use , replace after each use' },
 5: { name: 'Antiseptic wipes',     icon: '', defaultQty: 6, consumable: true, note: 'Single use , replace after each use' },
 6: { name: 'Instant cold pack',     icon: '', defaultQty: 2, consumable: true, note: 'Single use , activates on use, replace after' },
 7: { name: 'Pain relief tablets',    icon: '', defaultQty: 8, consumable: true, note: 'Single use per dose , replace when low' },
 8: { name: 'Antihistamine tablets',   icon: '', defaultQty: 6, consumable: true, note: 'Single use per dose , replace when low' },
 9: { name: 'Disposable gloves',     icon: '', defaultQty: 3, consumable: true, note: 'Single use , dispose after each emergency' },
 10: { name: 'Medical scissors',     icon: '', defaultQty: 1, consumable: false, note: 'Reusable , clean, sterilise and return to kit' },
 11: { name: 'Eye wash solution',     icon: '', defaultQty: 1, consumable: true, note: 'Replace when bottle is empty or opened >24hrs' },
 12: { name: 'Sterile eye pad',      icon: '', defaultQty: 2, consumable: true, note: 'Single use , replace after each use' },
};

// Items deducted per situation per level
// Deduction map , CONSUMABLE items only (reusable items like scissors and elastic bandage excluded)
// Item 2 (elastic bandage) , REUSABLE , wash and return, never deducted
// Item 10 (scissors)    , REUSABLE , sterilise and return, never deducted
const STOCK_DEDUCTION_MAP = {
 bleeding: { l1:[9,5,3,1], l2:[9,3,1], l3:[3]  },
 burn:   { l1:[4,7],   l2:[4],    l3:[]   },
 headache: { l1:[7],    l2:[],    l3:[]   },
 fainting: { l1:[],    l2:[],    l3:[]   },
 allergic: { l1:[8],    l2:[8],    l3:[]   },
 sprain:  { l1:[6],    l2:[6],    l3:[6]   },
 eyeinjury:{ l1:[11,12],  l2:[11,12],  l3:[11,12] },
 nosebleed:{ l1:[6],    l2:[6],    l3:[]   },
};

// ── State , persisted in sessionStorage ──────────────────────────────
function _defaultQuantities() {
 var q = {};
 Object.keys(KIT_ITEMS).forEach(function(k) { q[k] = KIT_ITEMS[k].defaultQty; });
 return q;
}

function _loadQty() {
 try { return JSON.parse(sessionStorage.getItem('smartaid_qty') || 'null') || _defaultQuantities(); }
 catch(e) { return _defaultQuantities(); }
}
function _saveQty(q) { sessionStorage.setItem('smartaid_qty', JSON.stringify(q)); }

function _loadThreshold() {
 return parseInt(sessionStorage.getItem('smartaid_threshold') || '1', 10);
}
function _saveThreshold(t) { sessionStorage.setItem('smartaid_threshold', String(t)); }

function _loadLog() {
 try { return JSON.parse(sessionStorage.getItem('smartaid_stock_log') || '{}'); }
 catch(e) { return {}; }
}
function _saveLog(log) { sessionStorage.setItem('smartaid_stock_log', JSON.stringify(log)); }

// ── Core deduction ────────────────────────────────────────────────────
function autoDeductStock(situationKey, triageLevel) {
 if (!situationKey || !triageLevel) return;
 var items = (STOCK_DEDUCTION_MAP[situationKey] || {})[triageLevel] || [];
 if (items.length === 0) return;

 var qty = _loadQty();
 var log = _loadLog();

 items.forEach(function(num) {
  var k = String(num);
  if (qty[k] === undefined) qty[k] = KIT_ITEMS[k] ? KIT_ITEMS[k].defaultQty: 1;
  qty[k] = Math.max(0, qty[k] - 1);
  if (!log[k]) log[k] = { uses: 0, situations: [] };
  log[k].uses += 1;
  var label = situationKey + ' (' + triageLevel.toUpperCase() + ')';
  if (log[k].situations.indexOf(label) === -1) log[k].situations.push(label);
 });

 _saveQty(qty);
 _saveLog(log);
 updateStockBar();
}

// ── Stock bar ─────────────────────────────────────────────────────────
function toggleStockPanel() {
 var panel = document.getElementById('stockPanel');
 if (panel) panel.classList.toggle('open');
}

function updateStockBar() {
 var qty = _loadQty();
 var threshold = _loadThreshold();
 var dot = document.getElementById('stockDot');
 var title = document.getElementById('stockBarTitle');
 var list = document.getElementById('stockItemList');
 var msg = document.getElementById('stockRestockMsg');
 var clearBtn = document.getElementById('stockClearBtn');
 var restockBtn = document.getElementById('stockRestockBtn');
 if (!dot || !title || !list) return;

 var lowItems = [];
 var zeroItems = [];
 Object.keys(KIT_ITEMS).forEach(function(k) {
  if (!KIT_ITEMS[k].consumable) return; // skip reusable items , they are never depleted
  var q = qty[k] !== undefined ? qty[k]: KIT_ITEMS[k].defaultQty;
  if (q === 0) zeroItems.push(k);
  else if (q <= threshold) lowItems.push(k);
 });

 var allGood = lowItems.length === 0 && zeroItems.length === 0;
 var critical = [3,9].some(function(n){ return zeroItems.indexOf(String(n)) !== -1; });

 if (allGood) {
  dot.className = 'stock-status-dot';
  title.textContent = ' Kit stock , all items ready';
 } else if (critical || zeroItems.length > 0) {
  dot.className = 'stock-status-dot red';
  title.textContent = ' Kit stock , ' + zeroItems.length + ' item' + (zeroItems.length !== 1 ? 's': '') + ' empty';
 } else {
  dot.className = 'stock-status-dot amber';
  title.textContent = ' Kit stock , ' + lowItems.length + ' item' + (lowItems.length !== 1 ? 's': '') + ' running low';
 }

 // Build full item list
 var rows = '';
 Object.keys(KIT_ITEMS).forEach(function(k) {
  var item = KIT_ITEMS[k];
  if (!item.consumable) {
   // Reusable items always show as "Reusable , clean & return"
   rows += '<div class="stock-item-row">' +
    '<span class="stock-item-num">#' + k + '</span>' +
    '<span class="stock-item-name">' + item.icon + ' ' + item.name + '</span>' +
    '<span class="stock-item-status" style="font-size:10px;font-weight:700;background:#0A1A2E;color:#60A5FA;padding:2px 7px;border-radius:4px;">Reusable</span>' +
    '</div>';
   return;
  }
  var q = qty[k] !== undefined ? qty[k]: item.defaultQty;
  var isLow = q <= threshold && q > 0;
  var isEmpty = q === 0;
  var statusClass = isEmpty ? 'stock-low': isLow ? 'stock-used': 'stock-ok';
  var statusText = isEmpty ? 'EMPTY': isLow ? 'Low , ' + q + ' left': q + ' remaining';
  rows += '<div class="stock-item-row">' +
   '<span class="stock-item-num">#' + k + '</span>' +
   '<span class="stock-item-name">' + item.icon + ' ' + item.name + '</span>' +
   '<span class="stock-item-status ' + statusClass + '">' + statusText + '</span>' +
   '</div>';
 });
 list.innerHTML = rows;

 // Restock message
 if (msg) {
  if (allGood) {
   msg.style.display = 'none';
  } else {
   var needNames = zeroItems.concat(lowItems).map(function(k){ return '#' + k + ' ' + KIT_ITEMS[k].name; });
   msg.className = 'stock-restock-msg' + (critical ? ' critical': '');
   msg.textContent = (critical ? ' ': ' ') + 'Restock needed: ' + needNames.join(', ');
   msg.style.display = 'block';
  }
 }
 if (clearBtn) clearBtn.style.display = allGood ? 'none': 'block';
 // Restock now button , takes the person straight to Kit setup where
 // they can actually change quantities , not just reset the counter.
 if (restockBtn) restockBtn.classList.toggle('hidden', allGood);
}

function clearStockLog() {
 var qty = _defaultQuantities();
 _saveQty(qty);
 _saveLog({});
 updateStockBar();
}

function markRestocked() {
 clearStockLog();
 showScreen('homeScreen');
}

// ── Restock notification screen ───────────────────────────────────────
function showRestockScreen(situationKey, triageLevel) {
 var items = (STOCK_DEDUCTION_MAP[situationKey] || {})[triageLevel] || [];
 if (items.length === 0) { showScreen('homeScreen'); return; }

 var qty = _loadQty();
 var threshold = _loadThreshold();
 var needRestock = items.filter(function(n) {
  var q = qty[String(n)] !== undefined ? qty[String(n)]: KIT_ITEMS[n].defaultQty;
  return q <= threshold;
 });

 // Only show restock screen if something is actually low/empty
 if (needRestock.length === 0) { showScreen('homeScreen'); return; }

 var header = document.getElementById('restockHeader');
 var sub = document.getElementById('restockSub');
 var itemList = document.getElementById('restockItemList');
 var smsText = document.getElementById('restockSmsText');

 var critical = needRestock.some(function(n){ return [3,9].indexOf(n) !== -1; });

 if (header) {
  header.textContent = critical ? ' Critical items need restocking': ' Kit restock recommended';
  header.className = 'restock-header' + (critical ? ' critical': '');
 }
 if (sub) {
  sub.textContent = 'The following items used in this ' + situationKey + ' emergency are now low or empty. Please restock before the next emergency.';
 }

 if (itemList) {
  var html = '';
  needRestock.forEach(function(num) {
   var item = KIT_ITEMS[num];
   if (!item) return;
   var q = qty[String(num)] !== undefined ? qty[String(num)]: 0;
   html += '<div class="restock-item">' +
    '<span class="restock-item-icon">' + item.icon + '</span>' +
    '<div class="restock-item-info">' +
     '<div class="restock-item-name">' + item.name + '</div>' +
     '<div class="restock-item-num">Item #' + num + ' , ' + (q === 0 ? 'EMPTY , must replace': q + ' remaining , restock soon') + '</div>' +
    '</div>' +
    '</div>';
  });
  // Also show reusable items used in this session with clean instructions
  var usedItems = (STOCK_DEDUCTION_MAP[situationKey] || {})[triageLevel] || [];
  // Find any reusable items that were part of guidance (scissors etc)
  var reusableUsed = [10, 2].filter(function(n) {
   // Check if scissors or elastic bandage were referenced in guidance for this situation
   var guidanceRef = { bleeding:[10], burn:[10], sprain:[2] };
   var refs = guidanceRef[situationKey] || [];
   return refs.indexOf(n) !== -1;
  });
  if (reusableUsed.length > 0) {
   html += '<div style="margin-top:10px;padding:8px 10px;background:#0A1A2E;border-left:3px solid #60A5FA;border-radius:4px;font-size:11px;color:#93C5FD;line-height:1.5;">' +
    '<b style="color:#60A5FA;">Reusable items , clean before returning:</b><br>' +
    reusableUsed.map(function(n){ return ' Item #' + n + ' ' + KIT_ITEMS[n].name + ' , clean, sterilise, return to kit'; }).join('<br>') +
    '</div>';
  }
  itemList.innerHTML = html;
 }

 if (smsText) {
  var names = needRestock.map(function(n){ return '#'+n+' '+KIT_ITEMS[n].name; }).join(', ');
  var now = new Date();
  var time = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  var date = now.toLocaleDateString([], {day:'numeric',month:'short',year:'numeric'});
  smsText.textContent =
   'SmartAid Kit Alert , ' + date + ' at ' + time + '\n' +
   'Emergency: ' + situationKey.charAt(0).toUpperCase() + situationKey.slice(1) + ' (' + triageLevel.toUpperCase() + ')\n' +
   'Items low or empty: ' + names + '\n' +
   'Action required: Restock before next emergency.\n' +
   ', SmartAid Kit, AID Electronic Co.';
 }

 showScreen('restockScreen');
}

// ── Setup screen ──────────────────────────────────────────────────────
function renderSetupScreen() {
 var qty = _loadQty();
 var threshold = _loadThreshold();
 var list = document.getElementById('setupItemList');
 var thresholdEl = document.getElementById('setupThreshold');
 if (!list) return;

 var html = '';
 Object.keys(KIT_ITEMS).forEach(function(k) {
  var item = KIT_ITEMS[k];
  var q = qty[k] !== undefined ? qty[k]: item.defaultQty;
  var reusableBadge = !item.consumable
   ? '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:#0A1A2E;color:#60A5FA;margin-left:6px;">REUSABLE</span>'
   : '';
  var consumableBadge = item.consumable
   ? '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:#1A0A0A;color:#F87171;margin-left:6px;">CONSUMABLE</span>'
   : '';
  var qtyControl = item.consumable
   ? '<div class="setup-qty-control">' +
     '<button class="setup-qty-btn" onclick="changeSetupQty(' + k + ', -1)">−</button>' +
     '<input class="setup-qty-val" type="number" id="setupQty_' + k + '" value="' + q + '" min="0" max="99" onchange="clampSetupQty(' + k + ', this.value)" />' +
     '<button class="setup-qty-btn" onclick="changeSetupQty(' + k + ', 1)">+</button>' +
    '</div>'
   : '<span style="font-size:11px;color:#555552;padding:0 8px;">Not tracked</span>';
  html += '<div class="setup-item-row">' +
   '<span class="setup-item-icon">' + item.icon + '</span>' +
   '<div class="setup-item-info">' +
    '<div class="setup-item-name">' + item.name + reusableBadge + consumableBadge + '</div>' +
    '<div class="setup-item-num">Item #' + k + ', ' + (item.note || '') + '</div>' +
   '</div>' +
   qtyControl +
   '</div>';
 });
 list.innerHTML = html;

 if (thresholdEl) thresholdEl.value = String(threshold);
}

function changeSetupQty(itemNum, delta) {
 var el = document.getElementById('setupQty_' + itemNum);
 if (!el) return;
 var val = Math.max(0, Math.min(99, parseInt(el.value || '0', 10) + delta));
 el.value = val;
}

function clampSetupQty(itemNum, val) {
 var el = document.getElementById('setupQty_' + itemNum);
 if (!el) return;
 el.value = Math.max(0, Math.min(99, parseInt(val || '0', 10)));
}

function saveSetup() {
 var qty = {};
 Object.keys(KIT_ITEMS).forEach(function(k) {
  var el = document.getElementById('setupQty_' + k);
  qty[k] = el ? Math.max(0, parseInt(el.value || '0', 10)): KIT_ITEMS[k].defaultQty;
 });
 _saveQty(qty);
 var thresholdEl = document.getElementById('setupThreshold');
 if (thresholdEl) _saveThreshold(parseInt(thresholdEl.value, 10));
 updateStockBar();
 showScreen('homeScreen');
}

function resetSetupToDefaults() {
 Object.keys(KIT_ITEMS).forEach(function(k) {
  var el = document.getElementById('setupQty_' + k);
  if (el) el.value = KIT_ITEMS[k].defaultQty;
 });
 var thresholdEl = document.getElementById('setupThreshold');
 if (thresholdEl) thresholdEl.value = '1';
}

// Initialise on page load
_onDomReady(function() { updateStockBar(); });

// ── GUIDANCE DONE STATE ───────────────────────────────────────────────
// Called when all steps finish speaking.
// Keeps person on guidance screen , steps remain readable and replayable.

function markAllStepsDone() {
 // Add subtle done styling to all steps
 var steps = document.querySelectorAll('#stepsList li');
 steps.forEach(function(li) { li.classList.add('step-done'); });
}

function showGuidanceDoneBanner() {
 var banner = document.getElementById('guidanceDoneBanner');
 if (banner) banner.classList.add('visible');
 // Hide the main speak button , replay is now in the done banner
 var speakBtn = document.getElementById('speakBtn');
 if (speakBtn) speakBtn.style.display = 'none';
}

function hideGuidanceDoneBanner() {
 var banner = document.getElementById('guidanceDoneBanner');
 if (banner) banner.classList.remove('visible');
 var speakBtn = document.getElementById('speakBtn');
 if (speakBtn) speakBtn.style.display = '';
 // Remove done styling from steps
 var steps = document.querySelectorAll('#stepsList li');
 steps.forEach(function(li) { li.classList.remove('step-done'); });
}

function askToRepeatSteps() {
 // Ask user if they want to hear the steps again
 var repeatQuestion = 'Do you want to hear the steps again?';
 _speakOne(repeatQuestion, function() {
  // Listening for user's response
  startListeningForRepeat();
 });
}

function startListeningForRepeat() {
 if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
 var recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
 recognition.lang = SPEECH_LANG_MAP[currentLang] || 'en-US';
 recognition.maxAlternatives = 1;
 recognition.onresult = function(event) {
  var transcript = '';
  for (var i = event.resultIndex; i < event.results.length; i++) {
   if (event.results[i].isFinal) {
    transcript += event.results[i][0].transcript;
   }
  }
  transcript = transcript.toLowerCase().trim();
  // Check for yes-like responses (yes, yeah, ya, repeat, again, ok, sure)
  var yesPatterns = /^(yes|yeah|ya|repeat|again|ok|okay|sure|affirmative|true)$/i;
  if (yesPatterns.test(transcript)) {
   document.getElementById('speakBtn').click();
  }
 };
 recognition.onerror = function() {
  // Silently ignore errors
 };
 recognition.start();
}

function showGuidanceRestockBanner(situationKey, triageLevel) {
 var qty = _loadQty();
 var threshold = _loadThreshold();
 var items = (STOCK_DEDUCTION_MAP[situationKey] || {})[triageLevel] || [];
 var needRestock = items.filter(function(n) {
  if (!KIT_ITEMS[n] || !KIT_ITEMS[n].consumable) return false;
  var q = qty[String(n)] !== undefined ? qty[String(n)]: KIT_ITEMS[n].defaultQty;
  return q <= threshold;
 });

 if (needRestock.length === 0) return; // nothing to flag

 var banner = document.getElementById('guidanceRestockBanner');
 var itemsEl = document.getElementById('guidanceRestockItems');
 if (!banner || !itemsEl) return;

 itemsEl.innerHTML = needRestock.map(function(n) {
  var item = KIT_ITEMS[n];
  var q = qty[String(n)] !== undefined ? qty[String(n)]: 0;
  return item.icon + ' #' + n + ' ' + item.name + ' , ' + (q === 0 ? 'EMPTY': q + ' remaining');
 }).join('<br>');

 banner.classList.add('visible');
}

function showFullRestockScreen() {
 var key = window._currentTriageKey || currentSituation;
 var level = window._currentTriageLevel || 'l1';
 showRestockScreen(key, level);
}

// Called when waiting steps finish on alert screen
function showWaitingDoneBanner(situationKey, triageLevel) {
 // On the alert screen we show restock in the existing waitingStepsBox area
 var box = document.getElementById('waitingStepsBox');
 if (!box) return;

 var qty = _loadQty();
 var threshold = _loadThreshold();
 var items = (STOCK_DEDUCTION_MAP[situationKey] || {})[triageLevel] || [];
 var needRestock = items.filter(function(n) {
  if (!KIT_ITEMS[n] || !KIT_ITEMS[n].consumable) return false;
  var q = qty[String(n)] !== undefined ? qty[String(n)]: KIT_ITEMS[n].defaultQty;
  return q <= threshold;
 });

 if (needRestock.length === 0) return;

 // Append restock notice to existing waiting steps box
 var existing = document.getElementById('waitingRestockNote');
 if (existing) return; // already shown

 var note = document.createElement('div');
 note.id = 'waitingRestockNote';
 note.style.cssText = 'margin-top:10px;padding:10px 12px;background:#2E1A0A;border:1px solid #7A4F00;border-radius:8px;font-size:11px;color:#FDE68A;line-height:1.6;';
 note.innerHTML = '<b style="color:#FBBF24;display:block;margin-bottom:4px;"> Restock after this emergency:</b>' +
  needRestock.map(function(n) {
   var item = KIT_ITEMS[n];
   return item.icon + ' #' + n + ' ' + item.name;
  }).join('<br>');
 box.appendChild(note);
}

// ── NAVIGATION, RESET & ALERT/ESCALATION FLOW ────────────────────────────
// Help button -> alertFaculty(); Emergency button -> alertClinic(). Both
// show step-by-step "while you wait" guidance (showWaitingSteps), asking
// what's wrong first via showQuickSituationPicker() if no situation was
// chosen through Assess/triage yet.
function goHome() {
 clearInterval(countdownInterval);
 if (window._calmingInterval) { clearTimeout(window._calmingInterval); window._calmingInterval = null; }
 window.speechSynthesis && window.speechSynthesis.cancel();
 triageRecognition && triageRecognition.abort();
 window._triageSpeak = null;
 window._triageSteps = null;
 currentTriageKey = null;
 window._currentTriageLevel = null;
 window._currentTriageKey = null;
 window._currentTriageLevelData = null;
 resetAnimation();
 // Reset guidance done state
 hideGuidanceDoneBanner();
 var rb = document.getElementById('guidanceRestockBanner');
 if (rb) rb.classList.remove('visible');
 var wr = document.getElementById('waitingRestockNote');
 if (wr) wr.remove();
 showScreen('homeScreen');
 document.getElementById('headerTitle').textContent = tr('headerHome');
 document.getElementById('micStatus').classList.add('hidden');
 document.getElementById('multiSummary').classList.add('hidden');
 document.getElementById('queueBox').classList.add('hidden');
 document.getElementById('correctionBanner').classList.add('hidden');
document.getElementById('helpBtn').disabled = false;
  document.getElementById('emergencyBtn').disabled = false;
  setStatus(currentSituation ? tr('statusGuidance') + SITUATIONS()[currentSituation].label: tr('statusReady'), 'idle');
}

function resetAll() {
 currentSituation = null;
 document.getElementById('helpBtn').disabled = false;
 document.getElementById('emergencyBtn').disabled = false;
 var qb = document.getElementById('quickSituationBox');
 if (qb) qb.classList.add('hidden');
 setStatus(tr('statusReady'), 'idle');
 goHome();
}

// ── Quick "what's wrong?" picker ────────────────────────────────────────
// Shown on the alert screen when Help or Emergency was pressed directly
// (no Assess/triage first), so the person can still get step-by-step
// guidance while waiting , not only when they went through triage.
function showQuickSituationPicker(level) {
 window._pendingWaitingLevel = level;
 var box = document.getElementById('quickSituationBox');
 var grid = document.getElementById('quickSituationGrid');
 if (!box || !grid) return;

 var data = SITUATIONS();
 grid.innerHTML = '';
 SITUATION_ORDER.forEach(function(key) {
  var s = data[key];
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'quick-situation-item';
  btn.innerHTML = '<span class="quick-situation-icon">' + s.icon + '</span>' +
   '<span class="quick-situation-name">' + s.label + '</span>';
  btn.onclick = function() { pickWaitingSituation(key); };
  grid.appendChild(btn);
 });

 box.classList.remove('hidden');
}

function pickWaitingSituation(key) {
 var langData = TRIAGE[currentLang] && TRIAGE[currentLang].situations[key]
  ? TRIAGE[currentLang].situations[key]
  : TRIAGE.en.situations[key];
 if (!langData) return;

 // Prefer the level matching how this alert started (l2 for Help/faculty,
 // l3 for Emergency/clinic), fall back to whichever level actually has
 // waiting guidance authored for it.
 var preferred = window._pendingWaitingLevel || 'l3';
 var level = (langData[preferred] && langData[preferred].waitingSteps) ? preferred:
  (langData.l3 && langData.l3.waitingSteps) ? 'l3':
  (langData.l2 && langData.l2.waitingSteps) ? 'l2': null;
 if (!level) return;

 var ld = langData[level];
 currentSituation = key;
 window._currentTriageKey = key;
 window._currentTriageLevel = level;
 window._currentTriageLevelData = ld;

 var box = document.getElementById('quickSituationBox');
 if (box) box.classList.add('hidden');

 var s = SITUATIONS()[key];
 var tag = document.getElementById('situationTag');
 if (tag && s) tag.textContent = s.label;
 activityLog.unshift({ time: new Date().toLocaleTimeString(), event: 'Identified while waiting: ' + (s ? s.label: key) });

 showWaitingSteps(ld, '⏳ While help is on the way:', key);
}

function alertFaculty() {
 markDeviceUsed();
 showScreen('alertScreen');
 document.getElementById('headerTitle').textContent = tr('headerHelp');
 document.getElementById('alertStatus').textContent = tr('alertFacultyStatus');
 document.getElementById('alertSub').textContent = 'Help is on the way. Stay calm.';
 document.getElementById('escalatedBox').classList.add('hidden');
 document.getElementById('waitingStepsBox').classList.add('hidden'); var _aw = document.getElementById('alertAnimWrap'); if (_aw) _aw.classList.add('hidden');
 var _qb = document.getElementById('quickSituationBox'); if (_qb) _qb.classList.add('hidden');
 document.getElementById('timerBox').classList.remove('hidden');
 document.getElementById('emergencyNowBtn').classList.remove('hidden');
 setStatus(tr('statusWaiting'), 'busy');
 startConnectionClock();

 const situationLabel = currentSituation ? SITUATIONS()[currentSituation].label: 'Unknown';
 activityLog.unshift({ time: new Date().toLocaleTimeString(), event: tr('logFacultyAlert') + situationLabel });

 // Speak calming message through unified voice engine , Help says help is on
 // the way (Emergency keeps its own "Emergency has been contacted" wording,
 // spoken separately via speakWaitingSteps).
 _speakOne('Help is on the way. Stay calm. Stay calm.', function() {});

 // Give step-by-step guidance while waiting for faculty too , not only
 // once escalated to the clinic. If we already know the situation (came
 // through triage), show its waiting steps now; otherwise ask what's wrong
 // so we still have something to guide the person with.
 var waitingData = window._currentTriageLevelData;
 if (waitingData && waitingData.waitingSteps && waitingData.waitingSteps.length > 0) {
  showWaitingSteps(waitingData, '⏳ While we wait for Sickbay/Med Assistant:', window._currentTriageKey || currentSituation);
 } else {
  showQuickSituationPicker('l2');
 }

 // 10-second countdown
 let secondsLeft = 10;
 updateTimerDisplay(secondsLeft);
 clearInterval(countdownInterval);
 countdownInterval = setInterval(function() {
  secondsLeft--;
  updateTimerDisplay(secondsLeft);
  if (secondsLeft <= 0) {
   clearInterval(countdownInterval);
   alertClinic('timeout');
  }
 }, 1000);
}

function showWaitingSteps(levelData, headerText, situationKey) {
 if (!levelData || !levelData.waitingSteps || levelData.waitingSteps.length === 0) return;
 // Capture the key at call time , do not rely on globals that might change
 var key = situationKey || window._currentTriageKey || currentSituation;
 var box = document.getElementById('waitingStepsBox');
 var list = document.getElementById('waitingStepsList');
 document.getElementById('waitingStepsHeader').textContent = headerText || '⏳ While help is on the way:';
 list.innerHTML = '';
 levelData.waitingSteps.forEach(function(step, i) {
  var li = document.createElement('li');
  li.textContent = step;
  li.style.cursor = 'pointer';
  li.onclick = (function(idx, k) {
   return function() { showWaitingStepAnimation(k, idx); };
  })(i, key);
  list.appendChild(li);
 });
 box.classList.remove('hidden');

 // Show alert animation panel , first waiting frame immediately
 var wrap = document.getElementById('alertAnimWrap');
 if (wrap) {
  wrap.classList.remove('hidden');
  showWaitingStepAnimation(key, 0);
 }

 // Speak steps passing key explicitly
 speakWaitingSteps(key);
}

function speakWaitingSteps(situationKey) {
 var ld = window._currentTriageLevelData;
 if (!ld || !ld.waitingSteps || ld.waitingSteps.length === 0) return;

 var key = situationKey || window._currentTriageKey || currentSituation;
 var steps = ld.waitingSteps;
 var listItems = Array.from(document.getElementById('waitingStepsList').querySelectorAll('li'));

 function clearHighlights() {
  listItems.forEach(function(li) { li.style.background = ''; li.style.fontWeight = ''; li.style.color = ''; });
 }

 // Build items: bridge opener + each step spoken TWICE
 var items = [{ text: 'Emergency has been contacted. Stay calm. Here is what to do right now.', index: -1, repeatTimes: 1 }];
 steps.forEach(function(step, i) {
  items.push({ text: 'Step ' + (i + 1) + '. ' + step, index: i, repeatTimes: 2 });
 });

 _speakQueue(items, function(idx) {
  clearHighlights();
  if (idx >= 0) {
   if (listItems[idx]) {
    listItems[idx].style.background = '#FFEAA0';
    listItems[idx].style.fontWeight = '700';
    listItems[idx].style.color = '#5A3C00';
    listItems[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
   }
   showWaitingStepAnimation(key, idx);
  }
 }, function() {
  clearHighlights();
  // Waiting steps complete , show restock banner inline, stay on alert screen
  var sKey = situationKey || window._currentTriageKey || currentSituation;
  var sLevel = window._currentTriageLevel || 'l3';
  setTimeout(function() {
   showWaitingDoneBanner(sKey, sLevel);
  }, 1000);
 });
}

function alertClinic(source) {
 markDeviceUsed();
 clearInterval(countdownInterval);
 clearInterval(connIntervalId);
 if (window._calmingInterval) { clearTimeout(window._calmingInterval); window._calmingInterval = null; }
 window.speechSynthesis.cancel();
 showScreen('alertScreen');
 document.getElementById('timerBox').classList.add('hidden');
 // Hide emergency button , clinic is already being contacted, pressing again makes no sense
 document.getElementById('emergencyNowBtn').classList.add('hidden');
 document.getElementById('escalatedBox').classList.remove('hidden');
 document.getElementById('waitingStepsBox').classList.add('hidden'); var _aw = document.getElementById('alertAnimWrap'); if (_aw) _aw.classList.add('hidden');
 var _qb = document.getElementById('quickSituationBox'); if (_qb) _qb.classList.add('hidden');
 setStatus(tr('statusClinic'), 'urgent');

 const situationLabel = currentSituation ? SITUATIONS()[currentSituation].label: 'Unknown';
 document.getElementById('headerTitle').textContent = tr('headerEmergency');

 // Capture key at this exact moment before anything can change it
 var waitingKey = window._currentTriageKey || currentSituation;
 var waitingData = window._currentTriageLevelData;

 if (source === 'timeout') {
  document.getElementById('alertStatus').textContent = tr('clinicTimeoutStatus');
  document.getElementById('alertSub').textContent = tr('clinicTimeoutSub');
  document.getElementById('escalatedBox').textContent = tr('clinicTimeoutBox');
  activityLog.unshift({ time: new Date().toLocaleTimeString(), event: tr('logEscalated') + situationLabel });
 } else if (source === 'triage-severe') {
  document.getElementById('alertStatus').textContent = ' Emergency alert sent';
  document.getElementById('alertSub').textContent = 'The nearby clinic has been contacted. Help is on the way.';
  document.getElementById('escalatedBox').textContent = ' Clinic notified , response being arranged now.';
  activityLog.unshift({ time: new Date().toLocaleTimeString(), event: 'Emergency (Severe): ' + situationLabel });
 } else {
  document.getElementById('alertStatus').textContent = tr('clinicManualStatus');
  document.getElementById('alertSub').textContent = tr('clinicManualSub');
  document.getElementById('escalatedBox').textContent = tr('clinicManualBox');
  activityLog.unshift({ time: new Date().toLocaleTimeString(), event: tr('logManualClinic') + situationLabel });
 }

 // Pass key explicitly , avoids any global timing issue
 if (waitingData && waitingData.waitingSteps && waitingData.waitingSteps.length > 0) {
  showWaitingSteps(waitingData, '⏳ Do this while help is on the way:', waitingKey);
 } else {
  // Went straight to Emergency with no situation chosen , ask what's
  // wrong so we can still guide step by step while the clinic responds.
  showQuickSituationPicker('l3');
 }
}

// ── TIMER, SCREEN SWITCHING & ACTIVITY LOG ──────────────────────────────
function updateTimerDisplay(seconds) {
 const m = String(Math.floor(seconds / 60)).padStart(2, '0');
 const s = String(seconds % 60).padStart(2, '0');
 document.getElementById('timerValue').textContent = m + ':' + s;
}

function showScreen(id) {
 const screens = ['homeScreen', 'guidanceScreen', 'alertScreen', 'logScreen', 'triageScreen', 'setupScreen', 'restockScreen'];
 const target = document.getElementById(id);
 if (!target) return;

 screens.forEach(function(s) {
  const el = document.getElementById(s);
  if (el && s !== id) el.classList.add('hidden');
 });

 target.classList.remove('hidden');
 target.classList.remove('screen-fade-in');
 void target.offsetWidth;
 target.classList.add('screen-fade-in');
}

function toggleLog() {
 const logScreen = document.getElementById('logScreen');
 const isHidden = logScreen.classList.contains('hidden');
 if (isHidden) {
  renderLog();
  ['homeScreen', 'guidanceScreen', 'alertScreen', 'triageScreen'].forEach(function(s) { document.getElementById(s).classList.add('hidden'); });
  logScreen.classList.remove('hidden');
 } else {
  logScreen.classList.add('hidden');
  document.getElementById('homeScreen').classList.remove('hidden');
 }
}

function renderLog() {
 const list = document.getElementById('logList');
 list.innerHTML = '';
 if (activityLog.length === 0) {
  list.innerHTML = '<li>' + tr('logEmpty') + '</li>';
  return;
 }
 activityLog.forEach(function(entry) {
  const li = document.createElement('li');
  li.innerHTML = '<b>' + entry.time + '</b> , ' + entry.event;
  list.appendChild(li);
 });
}

setLanguage('en');
startConnectionClock();
