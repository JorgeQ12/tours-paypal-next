"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import InvoiceModal from "@/components/InvoiceModal";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  
  // Estado para los datos del usuario
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "España"
  });

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCreateOrder = async () => {
    try {
      const response = await fetch("/api/create-paypal-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Enviar datos del usuario junto con los items del carrito
        body: JSON.stringify({ 
          items: cartItems,
          customer: userData 
        })
      });

      const order = await response.json();

      if (order.error) {
        throw new Error(order.error);
      }

      return order.id;
    } catch (error) {
      console.error("Error al crear la orden:", error);
      alert(
        "No se pudo crear la orden de PayPal. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleApprove = async (data) => {
    try {
      // Opcional: Llamar a tu API para capturar el pago
      const { orderID } = data;
      const response = await fetch("/api/capture-paypal-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderID }),
      });

      const orderData = await response.json();

      // Construir detalles de la orden
      const orderDetails = {
        id: orderID,
        value: orderData.purchase_units?.[0]?.amount?.value || "100.00",
        date: new Date().toLocaleString(),
        customerName: orderData.customerInfo?.name || `${userData.firstName} ${userData.lastName}`,
        customerEmail: orderData.customerInfo?.email || userData.email,
        customerPhone: userData.phone,
        items: cartItems // Incluir los items del carrito para la factura
      };
      
      // Guardar detalles de la orden
      setOrderDetails(orderDetails);
      
      // Guardar en localStorage para la página de confirmación
      localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
      
      setSuccessModalOpen(true);
      
      // Limpiar carrito después del pago exitoso
      localStorage.removeItem("cartItems");
      
      // Notificar al componente header
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error al aprobar la orden:", error);
      alert("Error al procesar el pago. Por favor, inténtalo de nuevo.");
    }
  };

  const handleCancel = () => {
    setCancelModalOpen(true);
  };

  useEffect(() => {
    setIsClient(true);
    const storedItems = localStorage.getItem("cartItems");

    if (storedItems) {
      setCartItems(JSON.parse(storedItems));
    } else {
      // Redirect to cart if no items
      router.push("/cart");
    }
  }, [router]);

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Handle PayPal payment
  const handlePayPalPayment = () => {
    // Simulate payment processing
    setIsPaymentProcessing(true);

    // Simulate a successful payment after 2 seconds
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setIsPaymentComplete(true);

      // Clear cart after successful payment
      localStorage.removeItem("cartItems");

      // Dispatch custom event to notify header component
      window.dispatchEvent(new Event("cartUpdated"));

      // Redirect to confirmation page after 3 seconds
      setTimeout(() => {
        router.push("/confirmation");
      }, 3000);
    }, 2000);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const SuccessModal = ({ isOpen, onClose, orderDetails }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-green-500"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Pago Completado!
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Tu compra se ha realizado con éxito. Te hemos enviado un correo
              electrónico con los detalles.
            </p>

            {orderDetails && (
              <div className="bg-gray-50 p-4 rounded-md w-full mb-4">
                <p className="font-medium text-gray-700 mb-2">
                  Detalles del pedido:
                </p>
                <p className="text-gray-600">
                  ID de transacción: {orderDetails.id}
                </p>
                <p className="text-gray-600">
                  Fecha: {orderDetails.date}
                </p>
                <p className="text-gray-600">
                  Total: ${orderDetails.value} USD
                </p>
                
                <div className="mt-4 pt-3 border-t">
                  <p className="font-medium text-gray-700 mb-2">
                    Datos del comprador:
                  </p>
                  <p className="text-gray-600">
                    Nombre: {orderDetails.customerName}
                  </p>
                  {orderDetails.customerEmail && (
                    <p className="text-gray-600">
                      Email: {orderDetails.customerEmail}
                    </p>
                  )}
                  {orderDetails.customerPhone && (
                    <p className="text-gray-600">
                      Teléfono: {orderDetails.customerPhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-4 mt-2">
              <button
                onClick={() => {
                  setInvoiceModalOpen(true);
                  onClose();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver factura
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de Cancelación
  const CancelModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-red-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Pago Cancelado
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Has cancelado el proceso de pago. Si tuviste algún problema, por
              favor ponte en contacto con nuestro equipo de soporte.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isClient) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">Cargando...</div>
    );
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
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Finalizar compra</h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Customer Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del comprador</CardTitle>
            <CardDescription>
              Por favor, introduce tus datos personales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input 
                  id="firstName" 
                  placeholder="Nombre" 
                  value={userData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input 
                  id="lastName" 
                  placeholder="Apellidos" 
                  value={userData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                value={userData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+34 600 000 000" 
                value={userData.phone}
                onChange={handleInputChange}
              />
            </div>

            {/* Replaced Separator with a simple div for visual separation */}
            <div className="h-px w-full bg-border my-4"></div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input 
                id="country" 
                placeholder="España" 
                value={userData.country}
                onChange={handleInputChange}
              />
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
              }}
            >
              <PayPalButtons
                createOrder={handleCreateOrder}
                onApprove={handleApprove}
                onCancel={handleCancel}
                style={{ color: "blue", layout: "horizontal" }}
                className="w-full z-10"
              />
            </PayPalScriptProvider>
            <p className="text-xs text-center text-muted-foreground">
              Al hacer clic en "Pagar con PayPal", aceptas nuestros términos y
              condiciones.
            </p>
          </CardFooter>
        </Card>
      </div>
      {/* Modales */}
      <SuccessModal 
        isOpen={successModalOpen} 
        onClose={() => setSuccessModalOpen(false)} 
        orderDetails={orderDetails} 
      />
      
      <CancelModal 
        isOpen={cancelModalOpen} 
        onClose={() => setCancelModalOpen(false)}
      />

      {/* Modal de Factura */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        orderDetails={orderDetails}
      />
    </div>
  );
}
