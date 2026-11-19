export async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calcular nuevas dimensiones manteniendo la proporción
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No se pudo crear el contexto");
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Exportamos como JPEG comprimido (calidad 0.8) para que pese poco
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject("Error al crear el blob");
        },
        "image/jpeg",
        0.8
      );
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}