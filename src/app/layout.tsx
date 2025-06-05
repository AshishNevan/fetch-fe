import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fetch Rewards - Adopt & Earn Points for Good",
  description:
    "Every adoption earns points you can redeem for pet supplies, vet visits, and more good deeds",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
