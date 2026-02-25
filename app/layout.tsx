import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip Ledge - Admin Console",
  description: "Next.js admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
