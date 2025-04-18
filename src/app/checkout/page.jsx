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
  const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;

  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [turnoId, setTurnoId] = useState(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Estado de datos del usuario
  const [userData, setUserData] = useState({
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    country:   "España",
    street:    "",
    city:      "",
    state:     "",
    postal:    ""
  });

  // Cambio genérico de inputs
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData(prev => ({ ...prev, [id]: value }));
  };

  // Comprueba que TODOS los campos de userData estén llenos
  const isFormValid = Object.values(userData).every(v => v.trim() !== "");

  // Crear orden en el backend
  const handleCreateOrder = async () => {
    const response = await fetch("/api/create-paypal-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems, customer: userData })
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error al crear orden (HTTP ${response.status}): ${text}`);
    }
    const { id, error } = await response.json();
    if (error) throw new Error(`PayPal error: ${error}`);
    if (!id)    throw new Error("No se devolvió order.id");
    return id;
  };

  // Capturar pago en backend y envio a wordpress
  const handleApprove = async (data) => {
    try 
    {
      const { orderID } = data;
      // Capture payment
      const captureRes = await fetch("/api/capture-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID })
      });

      const captureData = await captureRes.json();

      const capture = captureData.result.purchase_units[0].payments.captures[0];
      const orderInfo = {
        id:            orderID,
        value:         capture.amount.value,
        currency_code: capture.amount.currency_code,
        date:          new Date().toLocaleString(),
        customerName:  `${userData.firstName} ${userData.lastName}`,
        customerEmail: userData.email,
        customerPhone: userData.phone,
        items:         cartItems
      };

      setOrderDetails(orderInfo);
      localStorage.setItem("orderDetails", JSON.stringify(orderInfo));
      window.dispatchEvent(new Event("cartUpdated"));

      const totalCupos = cartItems.reduce((sum, item) => sum + item.quantity, 0);

     // Prepare payload for WP
      const wpPayload = {
        id: orderID,
        turnoId: turnoId,
        customerName: orderInfo.customerName,
        customerEmail: orderInfo.customerEmail,
        customerPhone: orderInfo.customerPhone,
        cupos: totalCupos,
        fecha_compra: new Date()
      };

      // Send to WordPress
      const wpRes = await fetch(`${WEB_URL}/wp-json/rs/v1/guardar-orden`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wpPayload)
        }
     );
      if (!wpRes.ok) console.error("WP guardar-orden error:", await wpRes.text());

      setSuccessModalOpen(true);
    } 
    catch (err) 
    {
      console.error("Error al aprobar la orden:", err);
      alert("Error al procesar el pago. Por favor, inténtalo de nuevo.");
    }
  };

  const handleCancel = () => setCancelModalOpen(true);

  // Cargar carrito al montar
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("cartItems");
    const storedTurno = localStorage.getItem("turnoId");
    if (stored) setCartItems(JSON.parse(stored)); else router.push("/cart");
    if (storedTurno) setTurnoId(storedTurno);
  }, [router]);

  // Total
  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);

  // Formato de fecha
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("es-ES", { year:"numeric", month:"long", day:"numeric" });

  // Modales
  const SuccessModal = ({ isOpen, onClose, orderDetails }) => {
    if (!isOpen) return null;
    return (
      <div className="customModal">
        <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Pago Completado!</h2>
            <p className="text-gray-600 text-center mb-4">
              Tu compra se ha realizado con éxito.
            </p>
            <div className="bg-gray-50 p-4 rounded-md w-full mb-4">
              <p className="font-medium mb-2">Detalles del pedido:</p>
              <p>ID: {orderDetails.id}</p>
              <p>Fecha: {orderDetails.date}</p>
              <p>Total: {orderDetails.value} {orderDetails.currency_code}</p>
              <div className="mt-4 pt-3 border-t">
                <p className="font-medium mb-2">Datos del comprador:</p>
                <p>Nombre: {orderDetails.customerName}</p>
                <p>Email: {orderDetails.customerEmail}</p>
                <p>Tel: {orderDetails.customerPhone}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => { setInvoiceModalOpen(true); onClose(); }}
                className="bg-green-800 text-white hover:bg-gray-400 focus:ring-2 focus:ring-offset-1 focus:ring-gray-700"
              >
                Ver factura
              </Button>

              <Button
                onClick={() => {
                  onClose();
                  router.push(WEB_URL);
                }}
                className="bg-gray-800 text-white hover:bg-gray-400 focus:ring-2 focus:ring-offset-1 focus:ring-gray-700"
              >
                Aceptar
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const CancelModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className="customModal">
        <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Pago Cancelado</h2>
          <p className="mb-4">Has cancelado el proceso de pago.</p>
          <Button  onClick={() => {
                  onClose();
                  router.push(WEB_URL);
                }}
                className="bg-gray-800 text-white hover:bg-gray-400 focus:ring-2 focus:ring-offset-1 focus:ring-gray-700"
          >
            Cerrar
          </Button>
        </div>
      </div>
    );
  };

  if (!isClient) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Finalizar compra</h1>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Formulario de datos y facturación */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del comprador</CardTitle>
            <CardDescription>Introduce tus datos personales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sección: Datos del comprador */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  placeholder="Tu nombre"
                  value={userData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  placeholder="Tus apellidos"
                  value={userData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={userData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+34 600 000 000"
                value={userData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                placeholder="España"
                value={userData.country}
                onChange={handleInputChange}
              />
            </div>

            {/* divider */}
            <div className="h-px bg-border my-6" />

            {/* Sección: Detalles de facturación */}
            <p className="leading-none font-semibold mb-2">Detalles de facturación</p>
            <p className="text-muted-foreground text-sm">Introduce tus datos de facturación</p>            
            <div>
              <Label htmlFor="street">Calle</Label>
              <Input
                id="street"
                placeholder="Calle de ejemplo 123"
                value={userData.street}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Madrid"
                  value={userData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="state">Provincia</Label>
                <Input
                  id="state"
                  placeholder="Madrid"
                  value={userData.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="postal">Código postal</Label>
              <Input
                id="postal"
                placeholder="28001"
                value={userData.postal}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen y pago */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del pedido</CardTitle>
            <CardDescription>Revisa tu pedido antes de pagar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map(item => (
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
                currency: "EUR",
              }}
            >
              <PayPalButtons
                createOrder={handleCreateOrder}
                onApprove={handleApprove}
                onCancel={handleCancel}
                disabled={!isFormValid}
                style={{ layout: "horizontal", color: "blue" }}
                className="w-full"
              />
            </PayPalScriptProvider>


            <p className="text-xs text-center text-muted-foreground">
              Al hacer clic en "Pagar con PayPal", aceptas nuestros términos.
            </p>
          </CardFooter>
        </Card>
      </div>

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        orderDetails={orderDetails}
      />
      <CancelModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
      />
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        orderDetails={orderDetails}
      />
    </div>
  );
}
