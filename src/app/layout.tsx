import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ParentProvider from "./ParentProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nostr Access Control Demo App",
  description: "Demo app using nostr-access-control library",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParentProvider>{children}</ParentProvider>
      </body>
    </html>
  );
}
