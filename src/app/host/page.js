import "./host.css";
import HostDashboardClient from "./HostDashboardClient";

export const metadata = {
  title: "Host Dashboard — ZQAVA",
  description: "Manage your hosted parties, guests and check-ins.",
};

export default function HostDashboardPage() {
  return (
    <main className="host-page">
      <HostDashboardClient />
    </main>
  );
}