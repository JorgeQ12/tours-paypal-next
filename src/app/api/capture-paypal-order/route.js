import { 
  Client, 
  Environment, 
  OrdersController, 
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
  try {
    const data = await request.json();
    const { orderID } = data;

    console.log("Capturing order:", orderID);

    if (!orderID) {
      return NextResponse.json(
        { error: "Se requiere ID de orden" },
        { status: 400 }
      );
    }

    const ordersController = new OrdersController(client);
    
    // Capturar la orden - Asegurar que orderID sea una cadena
    const orderId = String(orderID);
    const { result, ...httpResponse } = await ordersController.captureOrder(orderId);
    
    console.log("Capture result:", result);

    // mandar el resultado a wordpress

    // Extraer información del comprador
    const customerInfo = {
      name: result.payer?.name?.given_name + " " + result.payer?.name?.surname,
      email: result.payer?.email_address,
      payerId: result.payer?.payer_id,
      address: result.purchase_units[0]?.shipping?.address
    };

    // Log del comprador para debugging
    console.log("Customer info:", customerInfo);
    
    // Devolver la respuesta completa para que el frontend pueda mostrar detalles
    return NextResponse.json({ ...result, customerInfo });
  } catch (error) {
    console.error("Error capturing order:", error);
    
    if (error instanceof ApiError) {
      const errors = error.result;
      console.error("PayPal API Error:", errors);
      return NextResponse.json({ error: errors }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: "Error al capturar la orden de PayPal" },
      { status: 500 }
    );
  }
} 