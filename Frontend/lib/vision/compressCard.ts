interface ProcessResult {
  success: boolean;
  file?: File;
  error?: string;
}

export async function processAndCompressImage(file: File): Promise<ProcessResult> {
  // 1. Validation synchrone instantanée (Type & Taille Max)
  const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!acceptedTypes.includes(file.type)) {
    return { success: false, error: "Seuls les fichiers JPG, PNG et WEBP sont acceptés." };
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "L'image dépasse la taille maximale de 10 Mo." };
  }

  // 2. Traitement d'image (Résolution + Compression en une seule lecture)
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const width = img.width;
      const height = img.height;

      // Gestion Portrait/Paysage : le plus petit côté doit faire >= 230px et le plus grand >= 420px
      const minDimension = Math.min(width, height);
      const maxDimension = Math.max(width, height);



      // Si le fichier est DEJÀ petit (< 300 Ko) et bien dimensionné, on évite de le recompresser
      if (file.size < 300 * 1024 && maxDimension <= 1200) {
        resolve({ success: true, file });
        return;
      }

      // 3. Redimensionnement (Max 1200px sur la plus grande longueur)
      const MAX_SIDE = 1200;
      let targetWidth = width;
      let targetHeight = height;

      if (maxDimension > MAX_SIDE) {
        if (width > height) {
          targetWidth = MAX_SIDE;
          targetHeight = Math.round((height * MAX_SIDE) / width);
        } else {
          targetHeight = MAX_SIDE;
          targetWidth = Math.round((width * MAX_SIDE) / height);
        }
      }

      // 4. Export Canvas vers JPEG
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ success: false, error: "Erreur lors du traitement de l'image." });
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ success: false, error: "Impossible de compresser l'image." });
            return;
          }

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve({ success: true, file: compressedFile });
        },
        "image/jpeg",
        0.8 // Qualité 80%
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ success: false, error: "Fichier corrompu ou illisible." });
    };

    img.src = objectUrl;
  });
}