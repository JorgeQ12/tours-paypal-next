import TourBooking from "@/components/tour-booking"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Tour Ticket Booking</h1>
      <TourBooking />
    </main>
  )
}