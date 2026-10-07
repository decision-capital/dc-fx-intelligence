import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DC FX Intelligence | Decision Capital",
  description: "USD/PEN market monitor and analysis by Decision Capital",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
