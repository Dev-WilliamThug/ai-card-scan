"use client"
import { ImageUp } from 'lucide-react'
function FileInput() {
    return (
        <label className="group relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary transition-all duration-200 hover:border-primary hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10 active:scale-95 dark:bg-primary/10 dark:hover:bg-primary/20">
            <input type="file" className="hidden" onChange={(e) => console.log(e.target.files)} />
            <ImageUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110" />
            <span>Choisir un fichier</span>
        </label>
    )
}

export { FileInput }