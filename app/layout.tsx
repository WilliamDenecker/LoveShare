import type { Metadata } from "next";
import "./globals.css"; // Back to the standard relative path

export const metadata: Metadata = {
  title: "CoupleNotes",
  description: "A private shared space for two hearts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}