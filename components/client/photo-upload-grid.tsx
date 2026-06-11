"use client";

import { useEffect } from "react";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/utils/cn";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { MAX_PHOTOS } from "@/utils/validation";

interface PhotoUploadGridProps {
  onPhotosChange: (files: File[]) => void;
  error?: string;
}

export function PhotoUploadGrid({ onPhotosChange, error }: PhotoUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { photos, error: uploadError, isProcessing, addPhotos, removePhoto } =
    usePhotoUpload();

  const displayError = error ?? uploadError;
  const canAddMore = photos.length < MAX_PHOTOS;

  useEffect(() => {
    onPhotosChange(photos.map((photo) => photo.file));
  }, [photos, onPhotosChange]);

  const handleFiles = async (fileList: FileList | null) => {
    await addPhotos(fileList);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-[var(--color-card-foreground)]">
          Photos <span className="font-normal text-[var(--color-muted)]">(optionnel)</span>
        </label>
        <span className="text-xs text-[var(--color-muted)]">
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="photo-thumbnail relative aspect-square"
          >
            <Image
              src={photo.previewUrl}
              alt="Photo du problème"
              fill
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() => removePhoto(photo.id)}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Supprimer la photo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "photo-thumbnail flex aspect-square flex-col items-center justify-center gap-1",
              "border-2 border-dashed border-[var(--color-border)] text-[var(--color-muted)]",
              "transition-colors duration-150 hover:border-[var(--color-ring)] hover:text-[var(--color-card-foreground)]",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Camera className="h-6 w-6" />
            )}
            <span className="text-xs">Ajouter</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <p className="text-xs text-[var(--color-muted)]">
        Jusqu&apos;à {MAX_PHOTOS} photos. Compression automatique avant envoi.
      </p>

      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}
