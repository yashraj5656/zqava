import "./host-party.css";
import HostPartyClient from "./HostPartyClient";

export default async function HostPartyPage({ params }) {
  const { partyId } = await params;
  return (
    <main className="host-party-page">
      <HostPartyClient partyId={partyId} />
    </main>
  );
}