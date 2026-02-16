import type { Metadata } from "next";
import "@/styles/globals.css";
export const metadata: Metadata = { title: "ClassBandit", description: "Classroom pet rewards with SEL" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Figtree:wght@400;600;700&display=swap" rel="stylesheet"/>
    </head>
    <body>{children}</body>
  </html>;
}
