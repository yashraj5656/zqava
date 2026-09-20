import BookingChat from "@/components/BookingChat";

export default async function CompanionBookingChatPage({
  params,
}) {
  const { bookingId } = await params;

  return (
    <BookingChat
      bookingId={bookingId}
      backHref="/companion/dashboard"
    />
  );
}