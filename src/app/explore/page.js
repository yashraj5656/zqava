import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

export const metadata = {
  title: "ZQAVA — Meet. Connect. Experience.",
  description:
    "Discover companions and parties near you. Find people who match your plans.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExploreClient />
    </Suspense>
  );
}

function ExploreFallback() {
  return (
    <main className="explore-page">
      <div className="explore-container">
        <div className="explore-loading" style={{ minHeight: "60vh" }}>
          <div className="explore-spinner" />
          <p>Loading explore…</p>
        </div>
      </div>
    </main>
  );
}