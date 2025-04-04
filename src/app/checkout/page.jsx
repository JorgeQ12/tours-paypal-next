"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [isClient, setIsClient] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [isPaymentComplete, setIsPaymentComplete] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storedItems = localStorage.getItem("cartItems")

    if (storedItems) {
      setCartItems(JSON.parse(storedItems))
    } else {
      // Redirect to cart if no items
      router.push("/cart")
    }
  }, [router])

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Handle PayPal payment
  const handlePayPalPayment = () => {
    // Simulate payment processing
    setIsPaymentProcessing(true)

    // Simulate a successful payment after 2 seconds
    setTimeout(() => {
      setIsPaymentProcessing(false)
      setIsPaymentComplete(true)

      // Clear cart after successful payment
      localStorage.removeItem("cartItems")

      // Dispatch custom event to notify header component
      window.dispatchEvent(new Event("cartUpdated"))

      // Redirect to confirmation page after 3 seconds
      setTimeout(() => {
        router.push("/confirmation")
      }, 3000)
    }, 2000)
  }

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!isClient) {
    return <div className="container mx-auto py-8 px-4 text-center">Cargando...</div>
  }

  if (isPaymentComplete) {
    return (
      <div className="container mx-auto py-12 px-4 text-center max-w-md">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold">¡Pago completado!</h1>
          <p>Tu pedido ha sido procesado correctamente.</p>
          <p>Redirigiendo a la página de confirmación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Finalizar compra</h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Customer Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del comprador</CardTitle>
            <CardDescription>Por favor, introduce tus datos personales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" placeholder="Nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input id="lastName" placeholder="Apellidos" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@email.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" placeholder="+34 600 000 000" />
            </div>

            {/* Replaced Separator with a simple div for visual separation */}
            <div className="h-px w-full bg-border my-4"></div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="Calle, número, piso" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Código postal</Label>
                <Input id="postalCode" placeholder="28001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" placeholder="Madrid" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input id="country" placeholder="España" />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary and Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del pedido</CardTitle>
            <CardDescription>Revisa tu pedido antes de pagar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-3">
                <div>
                  <p className="font-medium">
                    {item.name} x {item.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.date)} • {item.language} • {item.time}
                  </p>
                </div>
                <p className="font-bold">{item.quantity * item.price} €</p>
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <p className="font-bold">Total</p>
              <p className="font-bold text-xl">{total} €</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <PayPalScriptProvider
              options={{
                "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
              }}>
                <PayPalButtons
                    style={{ color: "blue", layout: "horizontal", }}
                    className="w-full"
                />
              </PayPalScriptProvider>
            {/* <Button
              className="w-full h-12 bg-[#0070ba] hover:bg-[#003087] flex items-center justify-center"
              onClick={handlePayPalPayment}
              disabled={isPaymentProcessing}
            >
              {isPaymentProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  
                  <span>Pagar con PayPal</span>
                </div>
              )}
            </Button> */}
            <p className="text-xs text-center text-muted-foreground">
              Al hacer clic en "Pagar con PayPal", aceptas nuestros términos y condiciones.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}