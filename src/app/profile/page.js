import "./Profile.css";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "My profile — ZQAVA",
  description: "Manage your account and companion profile.",
};

export default function ProfilePage() {
  return (
    <main className="companion-profile-page">
      <ProfileClient />
    </main>
  );
}