import "./companion-dashboard.css";
import CompanionDashboardClient from "./CompanionDashboardClient";

export const metadata = {
  title: "Dashboard — ZQAVA Companion",
  description: "Manage your bookings and earnings in one place.",
};

export default function CompanionDashboardPage() {
  return (
    <main className="companion-dashboard-page">
      <CompanionDashboardClient />
    </main>
  );
}