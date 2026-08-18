import "./globals.css";

export const metadata = {
 title: "SmartAid Kit , Prototype",
 description:
  "Interactive prototype of the SmartAid Kit guided first aid device , voice-driven triage, tiered escalation, and automatic stock tracking.",
};

export default function RootLayout({ children }) {
 return (
  <html lang="en">
   <body>{children}</body>
  </html>
 );
}
