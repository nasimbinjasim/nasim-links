import "./globals.css";
import { Plus_Jakarta_Sans, Noto_Sans_Bengali } from "next/font/google";

const latin = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali", "latin"], variable: "--font-bn", display: "swap" });

export const metadata = {
  title: "Nasim Bin Jasim",
  description: "Executive Engineer, NESCO",
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${latin.variable} ${bengali.variable}`}>
      <body>{children}</body>
    </html>
  );
}
