import paypal from "@paypal/checkout-server-sdk";
import { NextResponse } from "next/server";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = new paypal.core.LiveEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request) {
  try 
  {
    // Leer items y customer del body
    const { items = [], customer = {} } = await request.json();

    // Calcular total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    // Nombre completo
    const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Cliente";

    // Crear la petición de orden
    const orderRequest = new paypal.orders.OrdersCreateRequest();
    orderRequest.prefer("return=representation");
    orderRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR", 
            value: total
          },
          shipping: {
            name: {
              full_name: fullName
            },
            address: {
              country_code: "ES",
              admin_area_1:  customer.state,    
              admin_area_2:  customer.city,    
              postal_code:   customer.postal,   
              address_line_1: customer.street   
            }
          }
        }
      ],
      application_context: {
        shipping_preference: "SET_PROVIDED_ADDRESS",
        locale:              "es-ES"
      }
    });

    // Ejecutar la petición
    const response = await client.execute(orderRequest);
    const result   = response.result;

    // Devolver el ID de la orden al frontend
    return NextResponse.json({ id: result.id });

  }
  catch (err) 
  {
    console.error("Error creando la orden:", err);

    // Errores de PayPal
    if (err.statusCode && err.message) {
      return NextResponse.json(
        { error: err.message, details: err },
        { status: err.statusCode }
      );
    }

    // Error genérico
    return NextResponse.json(
      { error: "Error al procesar la creación de la orden" },
      { status: 500 }
    );
  }
}
