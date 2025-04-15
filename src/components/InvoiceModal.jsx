import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "./InvoiceTemplate";
import { Printer, Download, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function InvoiceModal({ isOpen, onClose, orderDetails }) {
  const invoiceRef = useRef(null);

  // Función para imprimir la factura
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Factura-${orderDetails?.id || 'TOUR'}`,
    onBeforeGetContent: () => {
      // Asegurarse de que la referencia existe
      if (!invoiceRef.current) {
        console.error("No se encontró el contenido para imprimir");
        return Promise.reject("No content");
      }
      return Promise.resolve();
    },
    onPrintError: (error) => {
      console.error("Error al imprimir:", error);
    }
  });

  // Función para descargar como PDF
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      console.error("No se encontró el contenido para exportar a PDF");
      return;
    }

    try {
      const invoice = invoiceRef.current;
      const canvas = await html2canvas(invoice, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        allowTaint: false,
        removeContainer: true,
        // Ignorar los estilos de tailwind que podrían usar oklch
        ignoreElements: (element) => {
          // Verificar si el elemento tiene clases de tailwind que usan oklch
          if (element.className && typeof element.className === 'string' && 
             (element.className.includes("bg-") || 
              element.className.includes("text-") || 
              element.className.includes("border-"))) {
            return true;
          }
          return false;
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Factura-${orderDetails?.id || 'TOUR'}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Factura #{orderDetails?.id?.substring(0, 8) || ""}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Printer size={16} />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download size={16} />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto">
          <div ref={invoiceRef}>
            <InvoiceTemplate orderDetails={orderDetails} />
          </div>
        </div>
      </div>
    </div>
  );
} 