import { ScanPreview } from "@/app/components/ScanPreview";
import { Header } from "@/app/components/Header";
import { BottomBar } from "@/app/components/BottomBar";
import { ButtonScan } from "@/app/components/ButtonScan";
import { FileInput } from "@/app/components/FileInput";
export default function scan_page() {
    return (
        <>
            <Header />
            <main className="flex flex-col gap-4 py-20 px-10">
                <ScanPreview />
                <div className="h-1/3 flex flex-col gap-4">
                    <ButtonScan />
                    <FileInput />
                </div>

            </main>
            <BottomBar />
        </>

    )
}