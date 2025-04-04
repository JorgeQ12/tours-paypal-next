"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// Ticket types and prices
const ticketTypes = [
  {
    id: "eu-citizen",
    name: "Billetes de descuento para los ciudadanos de la UE",
    price: 32,
  },
  {
    id: "eu-student",
    name: "Billetes estudiantes de la UE (años 6-24)",
    price: 21,
  },
  {
    id: "non-eu-citizen",
    name: "Billetes para los ciudadanos no comunitarios",
    price: 50,
  },
  {
    id: "non-eu-student",
    name: "Billetes estudiantes no comunitarios (años 6-24)",
    price: 25,
  },
]

// Mock available tickets per type
const availableTickets = 10

export default function SummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedTickets, setSelectedTickets] = useState({})

  // Get query parameters
  const date = searchParams.get("date")
  const language = searchParams.get("language")
  const time = searchParams.get("time")

  // Format date for display
  const formattedDate = date
    ? new Date(date).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  // Handle ticket quantity change
  const handleTicketChange = (ticketId, quantity) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: Number.parseInt(quantity),
    }))
  }

  // Add to cart
  const addToCart = () => {
    // Check if any tickets are selected
    const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)

    if (totalTickets === 0) {
      alert("Por favor, selecciona al menos un billete")
      return
    }

    // Create cart items
    const cartItems = ticketTypes
      .filter((ticket) => selectedTickets[ticket.id] && selectedTickets[ticket.id] > 0)
      .map((ticket) => ({
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        quantity: selectedTickets[ticket.id],
        date: date,
        language: language,
        time: time,
      }))

    // In a real app, you would store this in a state management solution or localStorage
    // For this example, we'll use localStorage
    localStorage.setItem("cartItems", JSON.stringify(cartItems))

    // Dispatch custom event to notify header component
    window.dispatchEvent(new Event("cartUpdated"))

    // Navigate to cart page
    router.push("/cart")
  }

  // Generate options for ticket quantities
  const quantityOptions = Array.from({ length: availableTickets + 1 }, (_, i) => i.toString())

  if (!date || !language || !time) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Información incompleta</h1>
        <p>Por favor, vuelve a la página principal para seleccionar fecha, idioma y hora.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Resumen de tu selección</h1>

      <div className="max-w-2xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detalles del Tour</CardTitle>
            <CardDescription>Revisa los detalles de tu selección</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Fecha</h3>
                <p className="font-medium">{formattedDate}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Idioma</h3>
                <p className="font-medium">{language}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Hora</h3>
                <p className="font-medium">{time}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selecciona tus billetes</CardTitle>
            <CardDescription>Billetes disponibles para esta fecha, hora e idioma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketTypes.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                >
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-medium">{ticket.name}</h3>
                    <p className="text-lg font-bold">{ticket.price} €</p>
                  </div>
                  <Select
                    value={selectedTickets[ticket.id]?.toString() || "0"}
                    onValueChange={(value) => handleTicketChange(ticket.id, value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {quantityOptions.map((qty) => (
                        <SelectItem key={qty} value={qty}>
                          {qty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={addToCart}>
              Añadir a la cesta
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

