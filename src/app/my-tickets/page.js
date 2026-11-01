import "./my-tickets.css";
import MyTicketsClient from "./MyTicketsClient";

export const metadata = {
  title: "My Tickets — ZQAVA Parties",
  description: "View your booked party tickets.",
};

export default function MyTicketsPage() {
  return (
    <main className="my-tickets-page">
      <MyTicketsClient />
    </main>
  );
}