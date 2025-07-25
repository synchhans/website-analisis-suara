import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Analisis Suara AI",
    default: "Analisis Kepribadian dari Suara Berbasis AI",
  },
  description:
    "Gunakan teknologi AI canggih untuk menganalisis kepribadian Anda melalui intonasi dan pilihan kata. Coba gratis sekarang!",
  authors: [{ name: "Muhamad Farhan" }],
  creator: "Muhamad Farhan",
  metadataBase: new URL("https://analisis-suara.vercel.app"),
  keywords: [
    "analisis suara",
    "kepribadian AI",
    "tes kepribadian",
    "psikologi AI",
    "analisis ucapan",
  ],
  openGraph: {
    title: "Analisis Kepribadian dari Suara Berbasis AI",
    description:
      "Temukan tipe kepribadian Anda hanya dengan berbicara. Didukung oleh teknologi AI modern.",
    url: "https://analisis-suara.vercel.app",
    siteName: "Analisis Suara AI",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <footer className="text-center py-5 text-sm text-gray-500 border-t border-gray-200">
              © {new Date().getFullYear()} Analisis Suara AI.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
