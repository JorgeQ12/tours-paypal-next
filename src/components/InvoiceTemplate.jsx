import React from "react";
import QRCode from "react-qr-code";

// Definimos los colores estándar en formato hexadecimal que vamos a utilizar
const colors = {
  white: "#FFFFFF",
  black: "#000000",
  gray800: "#1F2937",
  gray700: "#374151",
  gray600: "#4B5563",
  gray500: "#6B7280",
  gray300: "#D1D5DB",
  gray200: "#E5E7EB",
  gray100: "#F3F4F6",
  gray50: "#F9FAFB",
  green600: "#059669",
  green500: "#10B981",
  green100: "#D1FAE5",
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  red500: "#EF4444",
  red100: "#FEE2E2",
};

const InvoiceTemplate = ({ orderDetails }) => {
  const { id, value, date, customerName, customerEmail, customerPhone, items } = orderDetails;

  return (
    <div 
      className="print-container"
      style={{
        backgroundColor: colors.white,
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      id="invoice-container"
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: colors.gray800 }}>FACTURA</h1>
          <p style={{ color: colors.gray600 }}>Tours PayPal Next</p>
          <p style={{ color: colors.gray600 }}>Calle Principal 123, Madrid, España</p>
          <p style={{ color: colors.gray600 }}>info@tours-paypal.com</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ width: "8rem", height: "8rem" }}>
            <QRCode 
              value={`https://tours-paypal.com/invoice/${id}`}
              size={128}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              level="H"
            />
          </div>
          <p style={{ fontSize: "0.875rem", color: colors.gray500, marginTop: "0.5rem" }}>ID: {id}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "0.5rem", color: colors.gray800 }}>Datos de cliente:</h2>
          <p style={{ color: colors.gray700 }}><strong>Nombre:</strong> {customerName}</p>
          <p style={{ color: colors.gray700 }}><strong>Email:</strong> {customerEmail}</p>
          {customerPhone && (
            <p style={{ color: colors.gray700 }}><strong>Teléfono:</strong> {customerPhone}</p>
          )}
        </div>
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "0.5rem", color: colors.gray800 }}>Detalles de factura:</h2>
          <p style={{ color: colors.gray700 }}><strong>Factura #:</strong> INV-{id?.substring(0, 8) || ""}</p>
          <p style={{ color: colors.gray700 }}><strong>Fecha:</strong> {date}</p>
          <p style={{ color: colors.gray700 }}>
            <strong>Estado:</strong> <span style={{ color: colors.green600, fontWeight: "bold" }}>Pagado</span>
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "1rem", color: colors.gray800 }}>Detalle de artículos</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: colors.gray100 }}>
              <th style={{ border: `1px solid ${colors.gray300}`, padding: "0.5rem", textAlign: "left" }}>Descripción</th>
              <th style={{ border: `1px solid ${colors.gray300}`, padding: "0.5rem", textAlign: "right" }}>Cantidad</th>
              <th style={{ border: `1px solid ${colors.gray300}`, padding: "0.5rem", textAlign: "right" }}>Precio</th>
              <th style={{ border: `1px solid ${colors.gray300}`, padding: "0.5rem", textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items && items.map((item, index) => (
              <tr key={index} style={{ borderBottom: `1px solid ${colors.gray200}` }}>
                <td style={{ border: `1px solid ${colors.gray300}`, padding: "0.5rem" }}>
                  <div>
                    <p style={{ fontWeight: "500" }}>{item.name}</p>
                    <p style={{ fontSize: "0.875rem", color: colors.gray500 }}>{item.language} • {item.time}</p>
                  </div>
                </td>
                <td style={{ border: `1px solid ${colors.gray300}`, padding: "0.5rem", textAlign: "right" }}>{item.quantity}</td>
                <td style={{ border: `1px solid ${colors.gray300}`, padding: "0.5rem", textAlign: "right" }}>${item.price?.toFixed(2) || "0.00"}</td>
                <td style={{ border: `1px solid ${colors.gray300}`, padding: "0.5rem", textAlign: "right" }}>${(item.price * item.quantity)?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "33.333%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
            <span style={{ fontWeight: "500" }}>Subtotal:</span>
            <span>${(parseFloat(value || 0) * 0.83).toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
            <span style={{ fontWeight: "500" }}>IVA (21%):</span>
            <span>${(parseFloat(value || 0) * 0.17).toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderTop: `1px solid ${colors.gray300}`, fontWeight: "bold" }}>
            <span>Total:</span>
            <span>${value || "0.00"}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: `1px solid ${colors.gray300}`, textAlign: "center", color: colors.gray500, fontSize: "0.875rem" }}>
        <p>Gracias por su compra. Si tiene alguna pregunta o necesita asistencia, contáctenos.</p>
        <p>Este documento es una representación digital de su factura.</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate; 