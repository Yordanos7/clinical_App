import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScanSuccess, onScanFailure }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
      setIsScanning(false);
    } catch (err) {
      console.error("Failed to stop scanner:", err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (!isScanning || !isMounted) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const config = {
      fps: 20,
      qrbox: { width: 300, height: 300 },
      rememberLastUsedCamera: true,
    };

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            if (!isMounted) return;
            await stopScanner();
            onScanSuccess(decodedText);
            setError(null);
          },
          (error) => {
            if (!isMounted) return;
            if (onScanFailure) onScanFailure(error);
            setError(
              "The QR Code is not detected by the camera or the QR code is not valid"
            );
          }
        );
      } catch (err) {
        if (!isMounted) return;
        console.error("Error starting QR scanner:", err);
        setError(err.message);
      }
    };

    startScanner();

    return () => {
      if (isMounted) {
        stopScanner();
      }
    };
  }, [onScanSuccess, onScanFailure, isScanning, isMounted]);

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader" style={{ width: "100%", maxWidth: "400px" }}></div>
      {error && <p className="error-message">{error}</p>}
      {!isScanning && (
        <button className="scan-again-btn" onClick={() => setIsScanning(true)}>
          Scan Again
        </button>
      )}
    </div>
  );
}
