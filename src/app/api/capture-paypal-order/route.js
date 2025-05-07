import paypal from "@paypal/checkout-server-sdk";
import { NextResponse } from "next/server";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = new paypal.core.PayPalEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request) {
  try 
  {
    // Obtén el orderID del cuerpo
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json(
        { error: "Se requiere el parámetro orderID" },
        { status: 400 }
      );
    }

    // Construye la petición de captura
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({}); 

    // Ejecuta la petición
    const captureResponse = await client.execute(captureRequest);
    const result = captureResponse.result;

    // Devuelve al frontend el resultado y la info de cliente
    return NextResponse.json({ result });
  } 
  catch (err) 
  {
    // Si viene de PayPal API
    if (err.statusCode && err.message) {
      return NextResponse.json(
        { error: err.message, details: err },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error interno al capturar la orden" },
      { status: 500 }
    );
  }
}