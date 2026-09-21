import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from "@/lib/AdminAuthContext";
import { MemberAuthProvider } from "@/lib/MemberAuthContext";
import SmoothScroll from "@/components/SmoothScroll";
import Starfield from "@/components/Starfield";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";

export const metadata: Metadata = {
  title: "AIML Club — GEC Ajmer",
  description: "The AI & ML Club at Government Engineering College, Ajmer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-playfair:"Playfair Display";--font-jakarta:"Plus Jakarta Sans";}`}</style>
      </head>
      <body>
        <PageLoader />
        <AdminAuthProvider>
          <MemberAuthProvider>
            <SmoothScroll>
              <Starfield />
              <Header />
              <main className="relative z-[3]">{children}</main>
              <Footer />
            </SmoothScroll>
          </MemberAuthProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}