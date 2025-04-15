import { 
    Client, 
    Environment, 
    OrdersController, 
    CheckoutPaymentIntent, 
    LogLevel,
    ApiError
  } from "@paypal/paypal-server-sdk";
  import { NextResponse } from "next/server";
  
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: true,
      },
      logResponse: {
        logHeaders: true,
      },
    },
  });
  
  export async function POST(request) {
    // Obtener datos del request si es necesario
    const data = await request.json();

    console.log("Request Data: ", data);
    
    const ordersController = new OrdersController(client);
  
    // Obtener datos del cliente si están disponibles
    const customer = data.customer || {};
    const items = data.items || [];
    
    // Calcular el total de la compra desde los items
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    
    // Construir el nombre completo del cliente
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || "Cliente";

    const collect = {
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: total,
            },
            // Información del comprador para la orden de PayPal
            shipping: {
              name: {
                full_name: fullName
              },
              email_address: customer.email || "",
              phone_number: customer.phone || "",
              address: {
                countryCode: "ES",
                adminArea1: "Madrid", // Estado/Provincia
                adminArea2: "Madrid", // Ciudad
                postalCode: "28001", // Código postal por defecto para España
                addressLine1: "Calle de ejemplo 123" // Dirección por defecto
              }
            }
          },
        ],
        application_context: {
          shipping_preference: "SET_PROVIDED_ADDRESS",
          locale: "es-ES"
        },
      },
      prefer: "return=minimal",
    };
  
    try {
      const { result, ...httpResponse } = await ordersController.createOrder(collect);
      // Get more response info...
      // const { statusCode, headers } = httpResponse;
      console.log("Response: ", result);
      
      // Devolver la respuesta como JSON
      return NextResponse.json({ id: result.id });
    } catch (error) {
      console.error("Error: ", error);
      if (error instanceof ApiError) {
        const errors = error.result;
        // const { statusCode, headers } = error;
        console.error("PayPal API Error: ", errors);
        return NextResponse.json({ error: errors }, { status: 500 });
      }
      
      // Error genérico
      return NextResponse.json({ error: "Error procesando la orden" }, { status: 500 });
    }
  }