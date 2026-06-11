"use client";

import { Spinner } from "@/components/ui/spinner";
import { useCallback, useRef, useState } from "react";
import { createRequestAction } from "@/app/actions/create-request";
import { AddressAutocompleteField } from "@/components/client/address-autocomplete-field";
import { CategorySearchField } from "@/components/client/category-search-field";
import { LandingHero } from "@/components/client/landing-hero";
import { PhotoUploadGrid } from "@/components/client/photo-upload-grid";
import { RequestConfirmation } from "@/components/client/request-confirmation";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/types";
import type { BanAddress } from "@/utils/geocoding";
import {
  hasFormErrors,
  validateClientForm,
  type ClientFormErrors,
} from "@/utils/validation";

interface ClientRequestFlowProps {
  categories: Category[];
}

export function ClientRequestFlow({ categories }: ClientRequestFlowProps) {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<BanAddress | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ClientFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missionCode, setMissionCode] = useState<string | null>(null);

  const handlePhotosChange = useCallback((files: File[]) => {
    setPhotos(files);
  }, []);

  const handleAddressSelect = useCallback((address: BanAddress | null) => {
    setSelectedAddress(address);
    if (address) {
      setFieldErrors((previous) => {
        if (!previous.clientAddress) return previous;
        const next = { ...previous };
        delete next.clientAddress;
        return next;
      });
    }
  }, []);

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const values = {
      categoryId: selectedCategory?.id ?? "",
      description: String(formData.get("description") ?? ""),
      clientName: String(formData.get("clientName") ?? ""),
      clientPhone: String(formData.get("clientPhone") ?? ""),
      clientAddress: selectedAddress?.label ?? "",
    };

    const errors = validateClientForm(values, photos.length, {
      selectedAddress,
    });
    setFieldErrors(errors);

    if (hasFormErrors(errors)) {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.set("categoryId", values.categoryId);
      payload.set("description", values.description);
      payload.set("clientName", values.clientName);
      payload.set("clientPhone", values.clientPhone);
      payload.set("clientAddress", selectedAddress!.label);
      payload.set("clientPostalCode", selectedAddress!.postcode);
      payload.set("clientCity", selectedAddress!.city);
      payload.set("clientLatitude", String(selectedAddress!.latitude));
      payload.set("clientLongitude", String(selectedAddress!.longitude));
      payload.set("clientAddressId", selectedAddress!.id);
      photos.forEach((photo) => payload.append("photos", photo));

      const result = await createRequestAction(payload);

      if (!result.success) {
        setSubmitError(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        return;
      }

      setMissionCode(result.missionCode);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Une erreur inattendue est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (missionCode) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <RequestConfirmation missionCode={missionCode} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-10 pb-6">
      <LandingHero onScrollToForm={scrollToForm} />

      <div ref={formSectionRef} id="request-form" className="scroll-mt-6 overflow-visible">
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle>Décrivez votre besoin</CardTitle>
            <CardDescription>
              Quelques informations suffisent pour trouver le bon professionnel.
            </CardDescription>
          </CardHeader>

          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="space-y-5"
          >
            <CategorySearchField
              categories={categories}
              error={fieldErrors.categoryId}
              onSelect={setSelectedCategory}
            />

            <Textarea
              name="description"
              label="Description"
              placeholder='Ex : "Fuite sous l&apos;évier depuis ce matin."'
              error={fieldErrors.description}
              rows={4}
            />

            <PhotoUploadGrid
              onPhotosChange={handlePhotosChange}
              error={fieldErrors.photos}
            />

            <Input
              name="clientName"
              label="Nom complet"
              placeholder="Prénom et nom"
              autoComplete="name"
              error={fieldErrors.clientName}
            />

            <Input
              name="clientPhone"
              label="Téléphone"
              type="tel"
              inputMode="tel"
              placeholder="06 12 34 56 78"
              autoComplete="tel"
              error={fieldErrors.clientPhone}
            />

            <AddressAutocompleteField
              selectedAddress={selectedAddress}
              error={fieldErrors.clientAddress}
              onSelect={handleAddressSelect}
            />

            {submitError && (
              <AlertBanner variant="error">{submitError}</AlertBanner>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Envoi en cours…
                </>
              ) : (
                "Trouver un professionnel"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
