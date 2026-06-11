import { useMemo, useState } from "react";
import type { Category } from "@/types";

export function normalizeCategorySearchTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeSearchTerm(term: string): string {
  return normalizeCategorySearchTerm(term);
}

export function useCategorySearch(categories: Category[]) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    const term = normalizeSearchTerm(search);
    if (!term) return categories;

    return categories.filter((category) => {
      const name = normalizeSearchTerm(category.name);
      return name.includes(term);
    });
  }, [categories, search]);

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setSearch(category.name);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedCategory(null);
    setSearch("");
    setIsOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setIsOpen(true);
    if (selectedCategory && value !== selectedCategory.name) {
      setSelectedCategory(null);
    }
  };

  return {
    search,
    selectedCategory,
    filteredCategories,
    isOpen,
    setIsOpen,
    setSearch: handleSearchChange,
    selectCategory,
    clearSelection,
  };
}

export function useCategoryMultiSearch(
  categories: Category[],
  selectedCategories: Category[]
) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    const term = normalizeSearchTerm(search);
    const available = categories.filter(
      (category) =>
        !selectedCategories.some((selected) => selected.id === category.id)
    );

    if (!term) return available;

    return available.filter((category) =>
      normalizeSearchTerm(category.name).includes(term)
    );
  }, [categories, search, selectedCategories]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setIsOpen(true);
  };

  const resetSearch = () => {
    setSearch("");
    setIsOpen(false);
  };

  return {
    search,
    filteredCategories,
    isOpen,
    setIsOpen,
    setSearch: handleSearchChange,
    resetSearch,
  };
}
