"use client";

import { Check, MapPin, X } from "lucide-react";
import { FieldError, fieldErrorId } from "@/components/ui/field-error";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import type { BanAddress } from "@/utils/geocoding";

interface AddressAutocompleteFieldProps {
  selectedAddress: BanAddress | null;
  error?: string;
  onSelect: (address: BanAddress | null) => void;
}

export function AddressAutocompleteField({
  selectedAddress,
  error,
  onSelect,
}: AddressAutocompleteFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    suggestions,
    isOpen,
    isLoading,
    setQuery,
    setIsOpen,
    selectAddress,
    clearSelection,
  } = useAddressAutocomplete(selectedAddress, onSelect);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const showSuggestions =
    isOpen &&
    query.trim().length >= 3 &&
    (!selectedAddress || query !== selectedAddress.label);

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-2">
      <label
        htmlFor="client-address"
        className="text-sm font-medium text-[var(--color-card-foreground)]"
      >
        Adresse
      </label>

      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2",
            selectedAddress
              ? "text-green-600 dark:text-green-400"
              : "text-[var(--color-muted)]"
          )}
        >
          {selectedAddress ? (
            <Check className="h-5 w-5" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </span>

        <input
          ref={inputRef}
          id="client-address"
          name="clientAddressInput"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onInput={(event) => setQuery(event.currentTarget.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Numéro, rue, code postal, ville"
          autoComplete="street-address"
          enterKeyHint="search"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? fieldErrorId("client-address") : undefined}
          className={cn(
            "input-field pl-12 pr-12",
            selectedAddress && "border-green-500 focus-visible:border-green-500 focus-visible:shadow-[0_0_0_3px_rgba(34,197,94,0.2)]",
            error && "input-field-error"
          )}
        />

        {isLoading && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2">
            <Spinner className="h-4 w-4 text-[var(--color-muted)]" />
          </span>
        )}

        {(query || selectedAddress) && (
          <button
            type="button"
            onClick={() => {
              clearSelection();
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-muted)] hover:text-[var(--color-card-foreground)]"
            aria-label="Effacer l'adresse"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {selectedAddress && (
        <p className="field-success">
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          {selectedAddress.postcode} {selectedAddress.city}
        </p>
      )}

      {error && (
        <FieldError id={fieldErrorId("client-address")} error={error} />
      )}

      {!selectedAddress && query.trim().length > 0 && query.trim().length < 3 && (
        <p className="field-hint">
          Saisissez au moins 3 caractères pour afficher des suggestions.
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="dropdown-panel absolute top-[calc(100%+8px)] z-30 max-h-64 w-full overflow-y-auto"
          role="listbox"
          aria-label="Suggestions d'adresses"
        >
          {suggestions.map((address) => (
            <li key={address.id}>
              <button
                type="button"
                role="option"
                aria-selected={selectedAddress?.id === address.id}
                onClick={() => selectAddress(address)}
                className="flex w-full flex-col gap-0.5 border-b border-[var(--color-border)] px-4 py-4 text-left last:border-b-0 hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/5 dark:active:bg-white/10"
              >
                <span className="font-medium text-[var(--color-card-foreground)]">
                  {address.name}
                </span>
                <span className="text-sm text-[var(--color-muted)]">
                  {address.postcode} {address.city}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && !isLoading && suggestions.length === 0 && (
        <p className="dropdown-panel absolute top-[calc(100%+8px)] z-30 w-full px-4 py-4 text-sm text-[var(--color-muted)]">
          Aucune adresse trouvée. Précisez votre saisie ou ajoutez le code postal.
        </p>
      )}

      {selectedAddress && (
        <>
          <input type="hidden" name="clientAddress" value={selectedAddress.label} />
          <input type="hidden" name="clientPostalCode" value={selectedAddress.postcode} />
          <input type="hidden" name="clientCity" value={selectedAddress.city} />
          <input
            type="hidden"
            name="clientLatitude"
            value={String(selectedAddress.latitude)}
          />
          <input
            type="hidden"
            name="clientLongitude"
            value={String(selectedAddress.longitude)}
          />
          <input type="hidden" name="clientAddressId" value={selectedAddress.id} />
        </>
      )}

      <p className="field-hint">
        Sélectionnez votre adresse dans la liste. Votre adresse sert uniquement à
        trouver un professionnel proche et ne sera pas visible avant confirmation
        de la mission.
      </p>
    </div>
  );
}
