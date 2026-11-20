# SmartAid Kit

SmartAid Kit is a browser-based first-aid guidance prototype. It helps a user
identify a situation, choose a severity level, follow visual and spoken
step-by-step guidance, and escalate to a faculty member or clinic when needed.
It also demonstrates first-aid supply tracking and restock alerts.

**Live app:** [smartaid-kit-summative.vercel.app](https://smartaid-kit-summative.vercel.app/)

> **Prototype notice:** This is an educational prototype, not a medical device
> or a substitute for emergency services or professional medical advice. In a
> real emergency, contact local emergency services.

## Features

- Guided instructions for supported situations and severity levels, with
  animated visuals.
- Voice-based situation and severity selection, with on-screen buttons as an
  alternative.
- Escalation guidance for contacting faculty or a clinic.
- English, French, and Kinyarwanda interface translations.
- Browser speech, an optional online generated-voice service, and user-uploaded
  audio options.
- First-aid supply quantity tracking, low-stock thresholds, and restock alerts.
- Kit setup and activity log screens for the prototype demonstration.

Voice recognition depends on browser support and microphone permission. Use a
supported browser over `localhost` or HTTPS and allow microphone access.
On-screen controls are available as an alternative. The app has no backend or
database; prototype settings are stored in the browser.

The optional online generated-voice service is an existing app feature and is
not required to run the prototype. Its API key is entered and stored in the
browser, not protected by a server. Do not enter a key that must remain secret.

## Requirements

- Windows 10/11, macOS, or Linux.
- Node.js 20.9 or later, which includes npm.
- Git.
- A current web browser. Chrome is recommended for voice recognition.

Check that Node.js, npm, and Git are installed:

```text
node --version
npm --version
git --version
```

## Install and run locally

1. Install Node.js 20.9 or later from [nodejs.org](https://nodejs.org/) and Git
   from [git-scm.com](https://git-scm.com/downloads), if needed.
2. Open PowerShell on Windows or a terminal on macOS/Linux.
3. Clone this repository and enter its folder:

   ```sh
   git clone https://github.com/Albert-Afiti/Smartaid-kit-Summative-.git
   cd Smartaid-kit-Summative-
   ```

4. Install the exact dependencies listed in the lockfile:

   ```sh
   npm ci
   ```

5. Start the development server:

   ```sh
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser. Leave
   the terminal running while you use the app. If Next.js prints a different
   local URL because port 3000 is busy, open that URL instead.
7. To stop the development server, focus the terminal and press `Ctrl+C`.

No environment variables or database setup are required.

## Check the project

From the project folder, run the linter:

```sh
npm run lint
```

Build and run the production version locally:

```sh
npm run build
npm run start
```

Then open [http://localhost:3000](http://localhost:3000). Stop the production
server with `Ctrl+C`.

## Hosted app

The app is deployed on Vercel and available at
[https://smartaid-kit-summative.vercel.app/](https://smartaid-kit-summative.vercel.app/).
Use a supported browser and allow microphone access for voice recognition;
on-screen controls are available as an alternative.

The Vercel deployment can be configured to build and deploy updates when
changes are pushed to its connected GitHub repository and branch.

## Project layout

- `app/page.js` mounts the prototype markup and loads its browser behavior.
- `app/bodyMarkup.js` contains the page markup.
- `app/globals.css` contains the application styles.
- `public/smartaid-app.js` contains the interactions, guidance content, and
  browser-side state.

This prototype does not provide server-side persistence or send real alerts to
emergency services. Treat its escalation screens and activity log as
demonstration functionality.
