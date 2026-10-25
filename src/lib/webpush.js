import webpush from "web-push";

import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushToUser(userId, notification) {
  await connectDB();

  const subscriptions = await PushSubscription.find({
    user: userId,
  }).lean();

  const payload = JSON.stringify({
    title: notification.title || "New ZQAVA message",
    body: notification.body || "You have a new message.",
    url: notification.url || "/explore",
    tag: notification.tag || "zqava-message",
  });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );
      } catch (error) {
        console.error("Push delivery failed:", error.statusCode);

        // Remove subscriptions that are no longer valid.
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({
            endpoint: subscription.endpoint,
          });
        }
      }
    })
  );
}