"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for available dates
const availableDates = [
  new Date(2025, 3, 5),
  new Date(2025, 3, 6),
  new Date(2025, 3, 7),
  new Date(2025, 3, 10),
  new Date(2025, 3, 12),
  new Date(2025, 3, 15),
  new Date(2025, 3, 20),
  new Date(2025, 3, 25),
]

// Mock data for available times by language
const availableTimes = {
  español: ["10:00", "12:00", "16:00"],
  inglés: ["09:00", "11:00", "14:00", "17:00"],
  francés: ["10:30", "15:30"],
  italiano: ["11:30", "16:30"],
}

export default function TourBooking() {
  const router = useRouter()
  const [date, setDate] = useState(undefined)
  const [language, setLanguage] = useState("")
  const [time, setTime] = useState("")

  const handleBuyTickets = () => {
    if (!date || !language || !time) {
      alert("Por favor, selecciona fecha, idioma y hora")
      return
    }

    // Format date as YYYY-MM-DD for URL
    const formattedDate = date.toISOString().split("T")[0]

    // Navigate to summary page with selected options
    router.push(`/summary?date=${formattedDate}&language=${language}&time=${time}`)
  }

  // Function to disable dates that are not available
  const disabledDays = (date) => {
    return !availableDates.some(
      (availableDate) =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear(),
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Selecciona tu tour</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Fecha</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabledDays}
            className="rounded-md border mx-auto"
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Idioma</h3>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="español">Español</SelectItem>
              <SelectItem value="inglés">Inglés</SelectItem>
              <SelectItem value="francés">Francés</SelectItem>
              <SelectItem value="italiano">Italiano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Hora</h3>
          <Select value={time} onValueChange={setTime} disabled={!language}>
            <SelectTrigger>
              <SelectValue placeholder={language ? "Selecciona una hora" : "Selecciona un idioma primero"} />
            </SelectTrigger>
            <SelectContent>
              {language &&
                availableTimes[language]?.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={handleBuyTickets} disabled={!date || !language || !time}>
          Comprar Entradas
        </Button>
      </CardContent>
    </Card>
  )
}