"use client";
import { useEffect, useRef } from "react";

function ScanPreview() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let isMounted = true; 
        const mediaQuery = window.matchMedia("(max-width: 767px)");

        async function startCamera() {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            if (!mediaQuery.matches) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            try {

                // Si le composant a été démonter pendant l'attente async, on ferme le flux immédiatement
                if (!isMounted) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    
                    try {
                        await videoRef.current.play();
                    } catch (error: any) {
                        // Ignorer spécifiquement l'interruption AbortError
                        if (error.name !== "AbortError") {
                            console.error("Erreur lors de la lecture de la vidéo :", error);
                        }
                    }
                }
            } catch (error) {
                console.error("Impossible d'accéder à la caméra :", error);
            }
        }

        startCamera();

        // Nettoyage lors du démontage du composant
        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="flex-1 w-full h-2/3 md:hidden"
        />
    );
}

export { ScanPreview };