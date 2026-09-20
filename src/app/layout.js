import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "ZQAVA — Meet. Connect. Experience.",
    template: "%s | ZQAVA",
  },
  description:
    "ZQAVA is a platform to discover and book verified companions for conversations, activities, events, and experiences.",
  keywords: [
    "ZQAVA",
    "companionship",
    "companions",
    "activities",
    "experiences",
    "book a companion",
    "social experiences",
  ],
  authors: [{ name: "ZQAVA" }],
  creator: "ZQAVA",
  publisher: "ZQAVA",

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "ZQAVA — Meet. Connect. Experience.",
    description:
      "Discover verified companions for conversations, activities, events, and experiences.",
    siteName: "ZQAVA",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ZQAVA — Meet. Connect. Experience.",
    description:
      "Discover and book verified companions for real-world experiences.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7444ff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"><head>
              {/* Favicon */}
        <link rel="icon" href="/zqava.jpg" /></head>
      <body className={inter.className}>
      <Navbar/>
        {children}
      <Footer/>  
      </body>
    </html>
  );
}