"use client";

import {
  BrickWall,
  Car,
  Flame,
  Flower2,
  Grid3x3,
  Hammer,
  Home,
  Key,
  Layout,
  Monitor,
  Mountain,
  Paintbrush,
  Plug,
  Ruler,
  Sparkles,
  Square,
  TreePine,
  Waves,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { FieldError, fieldErrorId } from "@/components/ui/field-error";
import { cn } from "@/utils/cn";
import { useCategoryMultiSearch, useCategorySearch } from "@/hooks/use-category-search";
import type { Category } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  wrench: Wrench,
  zap: Zap,
  flame: Flame,
  key: Key,
  wind: Wind,
  monitor: Monitor,
  plug: Plug,
  car: Car,
  hammer: Hammer,
  paintbrush: Paintbrush,
  ruler: Ruler,
  "brick-wall": BrickWall,
  layout: Layout,
  "grid-3x3": Grid3x3,
  "flower-2": Flower2,
  "tree-pine": TreePine,
  waves: Waves,
  mountain: Mountain,
  square: Square,
  home: Home,
  sparkles: Sparkles,
};

function CategoryIcon({ name }: { name: string | null }) {
  const Icon = (name && iconMap[name]) || Wrench;
  return <Icon className="h-5 w-5 shrink-0 text-[var(--color-accent)]" />;
}

interface CategorySearchFieldProps {
  categories: Category[];
  error?: string;
  onSelect: (category: Category | null) => void;
}

export function CategorySearchField({
  categories,
  error,
  onSelect,
}: CategorySearchFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    search,
    selectedCategory,
    filteredCategories,
    isOpen,
    setIsOpen,
    setSearch,
    selectCategory,
    clearSelection,
  } = useCategorySearch(categories);

  const selectAndNotify = (category: Category) => {
    selectCategory(category);
    onSelect(category);
  };

  const clearAndNotify = () => {
    clearSelection();
    onSelect(null);
  };

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

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-2">
      <label
        htmlFor="category-search"
        className="text-sm font-medium text-[var(--color-card-foreground)]"
      >
        Catégorie
      </label>

      <div className="relative">
        {selectedCategory && (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
            <CategoryIcon name={selectedCategory.icon} />
          </span>
        )}

        <input
          id="category-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Ex : plom, elec, chauff…"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? fieldErrorId("category-search") : undefined}
          className={cn(
            "input-field",
            selectedCategory ? "pl-12 pr-10" : "",
            error && "input-field-error"
          )}
        />

        {selectedCategory && (
          <button
            type="button"
            onClick={clearAndNotify}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted)] hover:text-[var(--color-card-foreground)]"
            aria-label="Effacer la catégorie"
          >
            ✕
          </button>
        )}

        {isOpen && filteredCategories.length > 0 && (
          <ul
            className="dropdown-panel absolute top-[calc(100%+8px)] z-20 max-h-56 w-full overflow-y-auto"
            role="listbox"
            aria-label="Suggestions de catégories"
          >
            {filteredCategories.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedCategory?.id === category.id}
                  onClick={() => selectAndNotify(category)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left text-[var(--color-card-foreground)]",
                    "hover:bg-black/5 dark:hover:bg-white/5",
                    selectedCategory?.id === category.id &&
                      "bg-black/5 dark:bg-white/5"
                  )}
                >
                  <CategoryIcon name={category.icon} />
                  <span>{category.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {isOpen && search && filteredCategories.length === 0 && (
          <p className="dropdown-panel absolute top-[calc(100%+8px)] z-20 w-full px-4 py-3 text-sm text-[var(--color-muted)]">
            Aucune catégorie trouvée.
          </p>
        )}
      </div>

      {error && (
        <FieldError id={fieldErrorId("category-search")} error={error} />
      )}
    </div>
  );
}

interface CategoryMultiSearchFieldProps {
  categories: Category[];
  selectedCategories: Category[];
  error?: string;
  inputId?: string;
  label?: string;
  onChange: (categories: Category[]) => void;
}

export function CategoryMultiSearchField({
  categories,
  selectedCategories,
  error,
  inputId = "category-multi-search",
  label = "Catégories",
  onChange,
}: CategoryMultiSearchFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    search,
    filteredCategories,
    isOpen,
    setIsOpen,
    setSearch,
    resetSearch,
  } = useCategoryMultiSearch(categories, selectedCategories);

  const addAndNotify = (category: Category) => {
    if (selectedCategories.some((item) => item.id === category.id)) {
      return;
    }
    onChange([...selectedCategories, category]);
    resetSearch();
  };

  const removeAndNotify = (categoryId: string) => {
    onChange(selectedCategories.filter((item) => item.id !== categoryId));
  };

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

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[var(--color-card-foreground)]"
      >
        {label}
      </label>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold text-[var(--color-card-foreground)]"
            >
              <CategoryIcon name={category.icon} />
              {category.name}
              <button
                type="button"
                onClick={() => removeAndNotify(category.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                aria-label={`Retirer ${category.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          id={inputId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Ex : plom, elec, chauff…"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? fieldErrorId(inputId) : undefined}
          className={cn("input-field", error && "input-field-error")}
        />

        {isOpen && filteredCategories.length > 0 && (
          <ul
            className="dropdown-panel absolute top-[calc(100%+8px)] z-20 max-h-56 w-full overflow-y-auto"
            role="listbox"
            aria-label="Suggestions de catégories"
          >
            {filteredCategories.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  role="option"
                  onClick={() => addAndNotify(category)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[var(--color-card-foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <CategoryIcon name={category.icon} />
                  <span>{category.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {isOpen && search && filteredCategories.length === 0 && (
          <p className="dropdown-panel absolute top-[calc(100%+8px)] z-20 w-full px-4 py-3 text-sm text-[var(--color-muted)]">
            Aucune catégorie trouvée.
          </p>
        )}
      </div>

      {error && <FieldError id={fieldErrorId(inputId)} error={error} />}
    </div>
  );
}
