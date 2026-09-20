import BookingChat from "@/components/BookingChat";

export default async function UserBookingChatPage({
  params,
}) {
  const { bookingId } = await params;

  return (
    <BookingChat
      bookingId={bookingId}
      backHref="/bookings"
    />
  );
}