import {Scan } from "lucide-react"
function ButtonScan() {
    return (
        <button className="btn btn-primary md:hidden">
            <Scan className="w-4 h-4" />
            Scan
        </button>
    )
}

export { ButtonScan }