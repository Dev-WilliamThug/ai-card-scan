"use client";
import { useEffect, useRef } from "react";

function ScanPreview() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    async function startCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current!.srcObject = stream;
        streamRef.current = stream
        videoRef.current!.play();
    }

    function closeCamera() {
        if (streamRef !== null) {
            streamRef.current?.getTracks().forEach((track) => {
                track.stop()
            })
        }
    }
    useEffect(() => {
        startCamera();
        return () => {
            closeCamera()
        }


    }, []);


    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className="flex-1 w-full  h-2/3 md:hidden"
        />
    );
}

export { ScanPreview }