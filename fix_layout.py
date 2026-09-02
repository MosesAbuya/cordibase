with open('apps/web/src/app/layout.tsx', 'w', encoding='utf-8') as f:
    f.write('''import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

import { ModalProvider } from "@/components/ModalProvider";

export const metadata: Metadata = {
  title: "Cordibase | The Relationship Board",
  description: "Relationships forming and staying connected, visualized literally.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={[jakarta.variable, plexMono.variable, "h-full", "antialiased"].join(" ")}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
''')
