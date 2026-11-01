import "./checkin.css";
import CheckinClient from "./CheckinClient";

export default async function CheckinPage({ params }) {
  const { id } = await params;
  return (
    <main className="checkin-page">
      <CheckinClient partyId={id} />
    </main>
  );
}