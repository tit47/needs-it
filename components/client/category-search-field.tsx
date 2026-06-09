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
import { cn } from "@/utils/cn";
import { useCategorySearch } from "@/hooks/use-category-search";
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
          className={cn(
            "h-14 w-full rounded-[var(--radius-input)] border border-[var(--color-border)]",
            "bg-[var(--color-input)] text-base text-[var(--color-card-foreground)]",
            "placeholder:text-[var(--color-muted)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
            selectedCategory ? "pl-12 pr-10" : "px-4",
            error && "border-red-500 focus-visible:ring-red-500"
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
            className="absolute top-[calc(100%+8px)] z-20 max-h-56 w-full overflow-y-auto rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg"
            role="listbox"
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
          <p className="absolute top-[calc(100%+8px)] z-20 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-muted)] shadow-lg">
            Aucune catégorie trouvée.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
