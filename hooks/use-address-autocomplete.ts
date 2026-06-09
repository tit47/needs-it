import { useCallback, useEffect, useRef, useState } from "react";
import { searchBanAddresses, type BanAddress } from "@/utils/geocoding";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export function useAddressAutocomplete(
  selectedAddress: BanAddress | null,
  onSelect: (address: BanAddress | null) => void
) {
  const [query, setQueryState] = useState("");
  const [suggestions, setSuggestions] = useState<BanAddress[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (selectedAddress) {
      setQueryState(selectedAddress.label);
    }
  }, [selectedAddress]);

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      setIsOpen(true);

      if (selectedAddress && value !== selectedAddress.label) {
        onSelect(null);
      }
    },
    [selectedAddress, onSelect]
  );

  const selectAddress = useCallback(
    (address: BanAddress) => {
      onSelect(address);
      setQueryState(address.label);
      setSuggestions([]);
      setIsOpen(false);
    },
    [onSelect]
  );

  const clearSelection = useCallback(() => {
    onSelect(null);
    setQueryState("");
    setSuggestions([]);
    setIsOpen(false);
  }, [onSelect]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    if (selectedAddress && query === selectedAddress.label) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    debounceRef.current = setTimeout(() => {
      void searchBanAddresses(query)
        .then((results) => {
          if (requestIdRef.current !== requestId) return;
          setSuggestions(results);
          setIsOpen(true);
        })
        .finally(() => {
          if (requestIdRef.current === requestId) {
            setIsLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selectedAddress]);

  return {
    query,
    suggestions,
    isOpen,
    isLoading,
    setQuery,
    setIsOpen,
    selectAddress,
    clearSelection,
  };
}
