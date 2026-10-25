
import webpush from "web-push";

import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

if (publicKey && privateKey && subject) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

/**
 * Send a push notification to every registered browser
 * belonging to one ZQAVA user.
 *
 * Call this from trusted server-side code only.
 */
export async function sendPushToUser(userId, notification) {
  if (!publicKey || !privateKey || !subject) {
    throw new Error("Web Push VAPID environment variables are missing.");
  }

  await connectDB();

  const subscriptions = await PushSubscription.find({ userId }).lean();

  const payload = JSON.stringify({
    title: notification.title || "ZQAVA",
    body: notification.body || "You have a new notification.",
    url: notification.url || "/",
    tag: notification.tag || "zqava-notification",
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            expirationTime: subscription.expirationTime,
          },
          payload
        );

        return { sent: true };
      } catch (error) {
        // 404 and 410 mean the subscription is no longer valid.
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({
            _id: subscription._id,
          });
        }

        throw error;
      }
    })
  );

  return {
    total: subscriptions.length,
    sent: results.filter(
      (result) => result.status === "fulfilled"
    ).length,
    failed: results.filter(
      (result) => result.status === "rejected"
    ).length,
  };
}
