import Script from "next/script";
import "./ticket-detail.css";
import TicketDetailClient from "./TicketDetailClient";

export default async function TicketDetailPage({ params }) {
  const { id } = await params;

  return (
    <main className="ticket-detail-page">
      {/* Load QR generator from a public CDN — no extra npm package needed */}
      <Script
        src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"
        strategy="afterInteractive"
      />
      <TicketDetailClient id={id} />
    </main>
  );
}