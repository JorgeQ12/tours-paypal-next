import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "./InvoiceTemplate";
import { Printer, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";

export default function InvoiceModal({ isOpen, onClose, orderDetails }) {
  const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
  const router = useRouter()
  const invoiceRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Factura-${orderDetails?.id || "TOUR"}`,
    onBeforeGetContent: () =>
      invoiceRef.current
        ? Promise.resolve()
        : Promise.reject("No hay contenido"),
    onPrintError: (err) => console.error("Print error:", err),
  });

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      console.error("No se encontró el contenido para exportar a PDF");
      return;
    }
  
    // 1) Crea el documento PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
  
    // 2) Usa el método html() incorporado
    await pdf.html(invoiceRef.current, {
      callback: (doc) => {
        // una vez renderizado
        doc.save(`Factura-${orderDetails?.id || "TOUR"}.pdf`);
      },
      x: 20,             // margen izquierdo
      y: 20,             // margen superior
      html2canvas: {
        scale: 1,        // aumentar/reducir calidad
        useCORS: true,
        backgroundColor: "#FFFFFF",
      },
      windowWidth: invoiceRef.current.scrollWidth,
      windowHeight: invoiceRef.current.scrollHeight,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="customModal">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Factura #{orderDetails?.id?.substring(0, 8) || ""}
          </h2>
          <div className="flex space-x-2">
            <Button onClick={handlePrint}>
              <Printer size={16} /> Imprimir
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download size={16} /> Descargar PDF
            </Button>
            <Button
              onClick={() => {
                onClose();
                router.push(WEB_URL);
              }}
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          <div ref={invoiceRef}>
            <InvoiceTemplate orderDetails={orderDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
