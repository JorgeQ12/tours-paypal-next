"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const pathname = usePathname()
  const [cartItems, setCartItems] = useState([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Load cart items from localStorage
    const loadCartItems = () => {
      const storedItems = localStorage.getItem("cartItems")
      if (storedItems) {
        setCartItems(JSON.parse(storedItems))
      }
    }

    // Load cart items on initial render
    loadCartItems()

    // Add event listener for storage changes (for cross-tab synchronization)
    const handleStorageChange = () => {
      loadCartItems()
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for cart updates within the same tab
    const handleCartUpdate = () => {
      loadCartItems()
    }

    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("cartUpdated", handleCartUpdate)
    }
  }, [])

  // Calculate total items and price
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Don't render cart count on the cart page
  const showCartCount = pathname !== "/cart"

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Tour Tickets
          </Link>

          <Link href="/cart">
            <Button variant="ghost" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {isClient && showCartCount && totalItems > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.5rem] flex items-center justify-center"
                  variant="destructive"
                >
                  {totalItems}
                </Badge>
              )}
              {isClient && showCartCount && totalItems > 0 && <span className="ml-2">{totalPrice}€</span>}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

