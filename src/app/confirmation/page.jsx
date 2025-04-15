"use client"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import InvoiceModal from "@/components/InvoiceModal"

export default function ConfirmationPage() {
  const router = useRouter()
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)

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
  
  // Recuperar los datos de la orden desde localStorage si existen
  useEffect(() => {
    const savedOrderDetails = localStorage.getItem("orderDetails")
    if (savedOrderDetails) {
      setOrderDetails(JSON.parse(savedOrderDetails))
    } else {
      // Si no hay datos reales, crear datos de ejemplo para la factura
      setOrderDetails({
        id: orderNumber,
        value: "100.00",
        date: orderDate,
        customerName: "Cliente de Ejemplo",
        customerEmail: "cliente@ejemplo.com",
        customerPhone: "+34 600 000 000",
        items: [
          {
            id: "demo-tour",
            name: "Tour guiado del Museo del Prado",
            price: 50,
            quantity: 2,
            date: new Date().toISOString(),
            language: "Español",
            time: "10:00"
          }
        ]
      })
    }
  }, [orderNumber, orderDate])

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
              <p className="font-medium">{orderDetails?.id || orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">{orderDetails?.date || orderDate}</p>
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
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Recibirás tus entradas por correo electrónico. Por favor, muestra el código QR en la entrada del tour.
          </p>
          
          <Button 
            onClick={() => setInvoiceModalOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Ver e imprimir factura
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center">
        <Button onClick={returnToHome} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la página principal
        </Button>
      </div>
      
      {/* Modal de Factura */}
      {orderDetails && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          orderDetails={orderDetails}
        />
      )}
    </div>
  )
}