"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Ticket types and prices
const ticketTypes = [
  { id: "eu-citizen", name: "Billetes de descuento para los ciudadanos de la UE", price: 32 },
  { id: "eu-student", name: "Billetes estudiantes de la UE (años 6-24)", price: 21 },
  { id: "non-eu-citizen", name: "Billetes para los ciudadanos no comunitarios", price: 50 },
  { id: "non-eu-student", name: "Billetes estudiantes no comunitarios (años 6-24)", price: 25 },
];

const availableTickets = 10;

export default function SummaryPage() {
  const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTickets, setSelectedTickets] = useState({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [language, setLanguage] = useState("");
  const [time, setTime] = useState("");
  const [turnoId, setTurnoId] = useState("");

  const tokenWordpress = searchParams.get("token");

  // Obtener los datos del token y guardar turnoId
  useEffect(() => {
    const fetchTokenData = async () => {
      if (!tokenWordpress) return;

      try {
        const res = await fetch(
          `${WEB_URL}/wp-json/rs/v1/token-data?token=${tokenWordpress}`
        );
        if (!res.ok) throw new Error("Token inválido o expirado");
        const data = await res.json();

        setTurnoId(data.turnoId);
        // Guardar turnoId en localStorage para usar luego en el checkout
        localStorage.setItem("turnoId", data.turnoId);

        setDate(data.fecha);
        setLanguage(data.idioma);
        setTime(data.hora);
        setLoading(false);
      } catch (err) {
        console.error("Error leyendo token:", err);
        router.push("/");
      }
    };

    fetchTokenData();
  }, [tokenWordpress, router]);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("es-ES", {
        timeZone: "UTC",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const handleTicketChange = (ticketId, quantity) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: parseInt(quantity, 10),
    }));
  };

  const addToCart = () => {
    const totalTickets = Object.values(selectedTickets).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (totalTickets === 0) {
      alert("Por favor, selecciona al menos un billete");
      return;
    }

    const cartItems = ticketTypes
      .filter((ticket) => selectedTickets[ticket.id] > 0)
      .map((ticket) => ({
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        quantity: selectedTickets[ticket.id],
        date,
        language,
        time,
        turnoId,
      }));

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));
    router.push("/cart");
  };

  const quantityOptions = Array.from(
    { length: availableTickets + 1 },
    (_, i) => i.toString()
  );

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Resumen de tu selección
      </h1>

      <div className="max-w-2xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detalles del Tour</CardTitle>
            <CardDescription>
              Revisa los detalles de tu selección
            </CardDescription>
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
            <CardDescription>
              Billetes disponibles para esta fecha, hora e idioma
            </CardDescription>
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
  );
}
