import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI missing");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected");

  const col = mongoose.connection.collection("bookings");

  const cursor = col.find({
    $or: [
      { checkinCode: { $exists: false } },
      { checkinCode: "" },
      { checkinCode: null },
    ],
  });

  let updated = 0;
  let skipped = 0;

  while (await cursor.hasNext()) {
    const booking = await cursor.next();

    // Skip cancelled/rejected bookings — they don't need codes
    if (["cancelled", "rejected"].includes(booking.status)) {
      skipped++;
      continue;
    }

    const checkinCode =
      "CK-" + crypto.randomBytes(4).toString("hex").toUpperCase();

    await col.updateOne(
      { _id: booking._id },
      { $set: { checkinCode } }
    );

    console.log(
      `✔ ${booking._id} → ${checkinCode} (${booking.status})`
    );
    updated++;
  }

  console.log("");
  console.log("────────────────────────────────");
  console.log(`✅ Backfilled: ${updated} bookings`);
  console.log(`⏭  Skipped (cancelled/rejected): ${skipped}`);
  console.log("────────────────────────────────");

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});