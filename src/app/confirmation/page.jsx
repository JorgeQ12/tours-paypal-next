"use client"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmationPage() {
  const router = useRouter()

  // Generate a random order number
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`

  // Get current date
  const orderDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Return to home
  const returnToHome = () => {
    router.push("/")
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">¡Gracias por tu compra!</h1>
        <p className="text-muted-foreground">Hemos enviado un correo electrónico con los detalles de tu pedido.</p>
      </div>

      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Detalles del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número de pedido</p>
              <p className="font-medium">{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">{orderDate}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <div className="flex items-center mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <p className="font-medium">Confirmado</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Método de pago</p>
            <p className="font-medium">PayPal</p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Recibirás tus entradas por correo electrónico. Por favor, muestra el código QR en la entrada del tour.
          </p>
        </CardFooter>
      </Card>

      <div className="text-center">
        <Button onClick={returnToHome} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la página principal
        </Button>
      </div>
    </div>
  )
}