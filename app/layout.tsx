import type { Metadata } from "next";
import "./globals.css";
import { RequireAuth } from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "LoveShare",
  description: "A private shared space for two hearts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RequireAuth>{children}</RequireAuth>
      </body>
    </html>
  );
}
