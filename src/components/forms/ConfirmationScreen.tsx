"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, Car } from "lucide-react";
import QRCode from "qrcode";

interface ConfirmationScreenProps {
  entryId: string;
  name: string;
  branchName: string;
  modelName: string;
  colourName: string;
  vin: string;
}

export function ConfirmationScreen({
  entryId,
  name,
  branchName,
  modelName,
  colourName,
  vin,
}: ConfirmationScreenProps) {
  const [qrCode, setQrCode] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    // Generate QR code for the absolute confirmation URL
    const url = `https://nippontoyota-onam.vercel.app/confirmation/${entryId}`;
    QRCode.toDataURL(url, {
      color: {
        dark: "#C3002F", // Toyota Red
        light: "#FFFFFF",
      },
      width: 200,
    })
      .then((url) => {
        if (!cancelled) setQrCode(url);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [entryId]);

  return (
    <Card className="w-full max-w-md mx-auto border-t-4 border-t-secondary shadow-lg rounded-xl overflow-hidden bg-white/95 backdrop-blur text-center">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-border/50 pb-6 items-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-2 drop-shadow" />
        <CardTitle className="text-2xl font-black text-foreground">
          Entry Confirmed!
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Thank you, <span className="font-bold text-foreground">{name}</span>.
        </p>
      </CardHeader>

      <CardContent className="pt-8 pb-8 flex flex-col items-center">
        <div className="w-full text-left space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Branch</p>
              <p className="text-sm font-medium">{branchName}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Car className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Vehicle Details</p>
              <p className="text-sm font-medium">{modelName} - {colourName}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">VIN: {vin}</p>
            </div>
          </div>
        </div>

        <div className="text-sm font-semibold mb-2">
          Your lucky draw entry is registered.
        </div>
        
        {qrCode && (
          <div className="bg-white p-2 rounded-xl shadow-inner border border-muted mt-2">
            <img src={qrCode} alt="Entry QR Code" className="w-48 h-48" />
          </div>
        )}
        <div className="mt-4 font-mono text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          {entryId}
        </div>
        
        <p className="text-xs text-muted-foreground mt-6 px-4">
          Please keep this QR code handy. We will notify you via WhatsApp before the announcement date.
        </p>
      </CardContent>
    </Card>
  );
}
