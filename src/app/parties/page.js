import "./parties.css";
import PartiesClient from "./PartiesClient";

export const metadata = {
  title: "ZQAVA Parties — Host or join a party",
  description:
    "Discover house parties, rooftop nights, bonfires and more. Host your own party or grab a ticket.",
};

export default function PartiesPage() {
  return (
    <main className="parties-page">
      <PartiesClient />
    </main>
  );
}