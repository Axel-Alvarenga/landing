"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";

interface StoreQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl: string;
  storeName: string;
}

export function StoreQRModal({ isOpen, onClose, storeUrl, storeName }: StoreQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && storeUrl) {
      // Generamos el QR en formato DataURL (imagen base64)
      QRCode.toDataURL(storeUrl, {
        width: 500,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generando QR:", err));
    } else {
      setQrDataUrl(null); // Limpiar al cerrar
    }
  }, [isOpen, storeUrl]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    // Limpiamos el nombre para que sea seguro en el sistema de archivos
    const safeName = storeName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    link.download = `qr-${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1a1e26]">
          <h2 className="text-lg font-bold text-white">QR de tu Tienda</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center bg-[#0f1115]">
          {qrDataUrl ? (
            <>
              <div className="bg-white p-3 rounded-xl shadow-lg">
                <img
                  src={qrDataUrl}
                  alt={`QR de ${storeName}`}
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-slate-400 text-sm mt-6 text-center">
                Escaneá este código para visitar <br />
                <strong className="text-white">/t/{storeUrl.split("/").pop()}</strong>
              </p>
            </>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-500 animate-pulse bg-slate-800 rounded-xl">
              Generando QR...
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#1a1e26] flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800"
          >
            Cerrar
          </button>
          <button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
          >
            ⬇ Descargar QR
          </button>
        </div>
      </div>
    </div>
  );
}   