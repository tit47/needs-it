import { useCallback, useState } from "react";
import {
  compressImage,
  validateImageFile,
} from "@/utils/image-compression";
import { generateId } from "@/utils/id";
import { MAX_PHOTOS } from "@/utils/validation";

export interface PhotoPreview {
  id: string;
  file: File;
  previewUrl: string;
}

export function usePhotoUpload() {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addPhotos = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;

      setError(null);

      if (photos.length >= MAX_PHOTOS) {
        setError(`Maximum ${MAX_PHOTOS} photos.`);
        return;
      }

      setIsProcessing(true);

      try {
        const incoming = Array.from(fileList);
        const availableSlots = MAX_PHOTOS - photos.length;
        const toProcess = incoming.slice(0, availableSlots);

        if (incoming.length > availableSlots) {
          setError(`Seules ${availableSlots} photo(s) supplémentaire(s) acceptée(s).`);
        }

        const newPhotos: PhotoPreview[] = [];

        for (const file of toProcess) {
          const validationError = validateImageFile(file);
          if (validationError) {
            setError(validationError);
            continue;
          }

          const compressed = await compressImage(file);
          newPhotos.push({
            id: generateId(),
            file: compressed,
            previewUrl: URL.createObjectURL(compressed),
          });
        }

        setPhotos((current) => [...current, ...newPhotos]);
      } finally {
        setIsProcessing(false);
      }
    },
    [photos.length]
  );

  const removePhoto = useCallback((id: string) => {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === id);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return current.filter((item) => item.id !== id);
    });
    setError(null);
  }, []);

  const clearPhotos = useCallback(() => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
    setError(null);
  }, [photos]);

  return {
    photos,
    error,
    isProcessing,
    addPhotos,
    removePhoto,
    clearPhotos,
  };
}
