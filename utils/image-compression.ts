const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.82;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function validateImageFile(file: File): string | null {
  if (!isImageFile(file)) {
    return "Seules les images sont acceptées.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Chaque photo doit faire moins de 8 Mo.";
  }
  return null;
}

export async function compressImage(file: File): Promise<File> {
  if (!isImageFile(file) || file.type === "image/gif") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
