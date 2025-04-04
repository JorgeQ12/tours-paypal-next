"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storedItems = localStorage.getItem("cartItems")
    if (storedItems) {
      setCartItems(JSON.parse(storedItems))
    }
  }, [])

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Remove item from cart
  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId)
    setCartItems(updatedItems)
    localStorage.setItem("cartItems", JSON.stringify(updatedItems))

    // Dispatch custom event to notify header component
    window.dispatchEvent(new Event("cartUpdated"))
  }

  // Clear cart
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cartItems")

    // Dispatch custom event to notify header component
    window.dispatchEvent(new Event("cartUpdated"))
  }

  // Continue shopping
  const continueShopping = () => {
    router.push("/")
  }

  // Proceed to checkout
  const proceedToCheckout = () => {
    router.push("/checkout")
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Tu carrito</h1>

      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">Tu carrito está vacío</p>
          <Button onClick={continueShopping}>Continuar comprando</Button>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resumen de tu pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between border-b pb-4">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.date)} • {item.language} • {item.time}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p>
                        {item.quantity} x {item.price} €
                      </p>
                      <p className="font-bold">{item.quantity * item.price} €</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between">
              <div className="mb-4 sm:mb-0">
                <p className="text-lg font-bold">Total: {total} €</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearCart}>
                  Vaciar carrito
                </Button>
                <Button onClick={proceedToCheckout}>Finalizar compra</Button>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center">
            <Button variant="link" onClick={continueShopping}>
              Continuar comprando
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

