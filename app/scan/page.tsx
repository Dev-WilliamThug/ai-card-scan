"use client"
import { Header } from "@/app/components/Header";
import { BottomBar } from "@/app/components/BottomBar";
import { ButtonScan } from "@/app/components/ButtonScan";
import { FileInput } from "@/app/components/FileInput";
import { SideBar } from "@/app/components/SideBar";
import { useState } from "react";
import {useRouter} from "next/navigation";
import { FormContact, ScannedData, ContactDetails } from "@/app/components/FormContact";

export default function scan_page() {
    const [scannedData, setScannedData] = useState<ScannedData | null>(null);
    const router = useRouter()
    const handleScanComplete = (data: ScannedData) => {
        setScannedData(data);
    }
    const handleSaved = (newContact: ContactDetails) => {
        setScannedData(null);
        router.replace("/contacts")
    };
    return (
        <>
            <Header />
            <SideBar />
            <main className="flex flex-col gap-4 py-20 px-10 md:pl-66">
                {!scannedData ?
                    (<>
                        <div className="h-1/3 flex flex-col gap-4">
                            <ButtonScan />
                            <FileInput onScanComplete={handleScanComplete} />
                        </div>
                    </>
                    ) : (
                        <FormContact
                            scannedData={scannedData}
                            onClose={() => setScannedData(null)}
                            onSaved={handleSaved}
                        />
                    )


                }
            </main >
            <BottomBar />
        </>

    )
}

