"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Wand2, ArrowRight } from "lucide-react";
import { processAndCompressImage } from "@/lib/vision/compressCard";

interface FileInputProps {
  onScanComplete?: (data: any) => void;
}

export function FileInput({ onScanComplete }: FileInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);


  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setFile(null);
    setIsProcessing(true);
    try {
      const delay = new Promise((resolve) => setTimeout(resolve, 800));
      const [result] = await Promise.all([
        processAndCompressImage(selectedFile),
        delay,
      ]); //Récupère juste le premier elément du tableau qui est l'image compressé

      if (!result.success) {
        setError("Erreur lors du traitement de l'image.");
        return;
      }

      setFile(result.file!);

    } catch (err) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsProcessing(false);
    }
  }


  async function handleStartScan() {
    if (!file) return;
    setIsScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/scan-card", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Code HTTP :", response.status); // Ex: 400
        console.log("Message d'erreur :", errorData.error);
        throw new Error("Erreur lors du traitement par l'IA. Réessayer dans quelques instants")
      }

      const resData = await response.json();

      if (!resData.success) {
        throw new Error("Données inexistantes.");
      }
/*       console.log("Données extraites :", resData.data); */
      if (onScanComplete) {
        onScanComplete(resData.data);
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsScanning(false);
    }

  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="relative border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-6 text-center transition-all bg-gray-50/50 hover:bg-blue-50/30">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          disabled={isProcessing || isScanning}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-white rounded-full shadow-sm text-blue-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            Glissez une carte de visite ou <span className="text-blue-600 font-semibold">parcourez</span>
          </p>
          <p className="text-xs text-red-400">Assurez vous que l'image soit bien entière pour un meilleur résultat</p>
        </div>
      </div>


      {isProcessing && (
        <div className="flex items-center gap-3 p-4 bg-blue-50/80 border border-blue-100 rounded-xl text-blue-900 shadow-sm animate-in fade-in duration-200">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Optimisation en cours...</span>
            <span className="text-xs text-blue-600/80">Redimensionnement & contrôle de la lisibilité</span>
          </div>
        </div>
      )}


      {error && !isProcessing && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}


      {file && !isProcessing && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Image optimisée</p>
                <p className="text-xs text-emerald-600/80">{(file.size / 1024).toFixed(0)} Ko • Prête pour l'IA</p>
              </div>
            </div>
          </div>


          <button
            onClick={handleStartScan}
            disabled={isScanning || isProcessing}
            className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyse IA en cours...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Extraire les données avec l'IA</span>
                <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}