import Script from "next/script";
import "./party-detail.css";
import PartyDetailClient from "./PartyDetailClient";

export default async function PartyDetailPage({ params }) {
  const { id } = await params;

  return (
    <main className="party-detail-page">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <PartyDetailClient id={id} />
    </main>
  );
}