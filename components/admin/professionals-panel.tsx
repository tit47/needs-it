"use client";

import { useState, useTransition } from "react";
import {
  createProfessionalAction,
  getProfessionalDetailAction,
  suspendProfessionalAction,
  updateProfessionalAction,
} from "@/app/actions/admin";
import {
  ActiveStatusBadge,
  InvoiceStatusBadge,
  RequestStatusBadge,
} from "@/components/admin/status-badges";
import { AddressAutocompleteField } from "@/components/client/address-autocomplete-field";
import { CategoryMultiSearchField } from "@/components/client/category-search-field";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BanAddress } from "@/utils/geocoding";
import type { Category, Invoice, Professional, RequestStatus } from "@/types";
import { formatDateFr, formatDateTimeFr } from "@/utils/datetime";
import { formatEur, formatMonthFr } from "@/utils/invoices";

type ProfessionalRow = Professional;

interface ProfessionalsPanelProps {
  professionals: ProfessionalRow[];
  activeCategories: Category[];
}

const EMPTY_CREATE_FORM = {
  full_name: "",
  email: "",
  phone: "",
  siren: "",
  radius_km: "30",
  active: true,
};

export function ProfessionalsPanel({
  professionals,
  activeCategories,
}: ProfessionalsPanelProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<ProfessionalRow | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Invoice[]>([]);
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    siren: "",
    categories: "",
    radius_km: "30",
  });
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<BanAddress | null>(
    null
  );
  const [addressError, setAddressError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openDetail = (professional: ProfessionalRow) => {
    setSelected(professional);
    setDetailOpen(true);
    setError(null);
    setHistory([]);
    setPaymentHistory([]);
    setUnpaidAmount(0);
    startTransition(async () => {
      const result = await getProfessionalDetailAction(professional.id);
      if (!result.success) {
        setError(result.error ?? "Impossible de charger la fiche.");
        return;
      }
      setHistory(result.data.history);
      setPaymentHistory(result.data.paymentHistory);
      setUnpaidAmount(result.data.unpaidAmount);
    });
  };

  const openEdit = (professional: ProfessionalRow) => {
    setSelected(professional);
    setForm({
      full_name: professional.full_name,
      email: professional.email,
      phone: professional.phone,
      address: professional.address,
      city: professional.city,
      siren: professional.siren,
      categories: professional.categories.join(", "),
      radius_km: String(professional.radius_km),
    });
    setEditOpen(true);
    setError(null);
  };

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setSelectedCategories([]);
    setSelectedAddress(null);
    setAddressError(null);
    setCategoriesError(null);
    setCreateOpen(true);
    setError(null);
  };

  const handleCreate = () => {
    if (!selectedAddress) {
      setAddressError(
        "Veuillez sélectionner une adresse dans la liste de suggestions."
      );
      return;
    }

    if (selectedCategories.length === 0) {
      setCategoriesError("Au moins une catégorie est requise.");
      return;
    }

    setAddressError(null);
    setCategoriesError(null);
    startTransition(async () => {
      const result = await createProfessionalAction({
        full_name: createForm.full_name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        siren: createForm.siren.trim(),
        addressId: selectedAddress.id,
        addressLabel: selectedAddress.label,
        categories: selectedCategories.map((category) => category.name),
        radius_km: Number(createForm.radius_km) || 30,
        active: createForm.active,
      });

      if (!result.success) {
        setError(result.error ?? "Création impossible.");
        return;
      }

      setCreateOpen(false);
    });
  };

  const handleSuspend = (professional: ProfessionalRow) => {
    startTransition(async () => {
      const result = await suspendProfessionalAction(
        professional.id,
        !professional.active
      );
      if (!result.success) {
        setError(result.error ?? "Action impossible.");
      }
    });
  };

  const handleSave = () => {
    if (!selected) return;

    startTransition(async () => {
      const result = await updateProfessionalAction(selected.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        siren: form.siren.trim(),
        categories: form.categories
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        radius_km: Number(form.radius_km) || 30,
      });

      if (!result.success) {
        setError(result.error ?? "Enregistrement impossible.");
        return;
      }

      setEditOpen(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Ajouter un professionnel</Button>
      </div>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Catégories</TableHead>
              <TableHead>Rayon</TableHead>
              <TableHead>Missions</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.length === 0 ? (
              <TableEmpty message="Aucun professionnel enregistré." />
            ) : (
              professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell className="font-medium">
                    {professional.full_name}
                  </TableCell>
                  <TableCell>{professional.city}</TableCell>
                  <TableCell>
                    <div className="flex max-w-[220px] flex-wrap gap-1">
                      {professional.categories.slice(0, 2).map((category) => (
                        <Badge key={category} variant="accent">
                          {category}
                        </Badge>
                      ))}
                      {professional.categories.length > 2 && (
                        <Badge>+{professional.categories.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{professional.radius_km} km</TableCell>
                  <TableCell>{professional.completed_jobs}</TableCell>
                  <TableCell>
                    <ActiveStatusBadge active={professional.active} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(professional)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant={professional.active ? "danger" : "primary"}
                        onClick={() => handleSuspend(professional)}
                        disabled={isPending}
                      >
                        {professional.active ? "Suspendre" : "Réactiver"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDetail(professional)}
                      >
                        Voir fiche
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Fiche professionnel"
        className="max-w-2xl"
      >
        {isPending && !history.length && !paymentHistory.length && selected && (
          <LoadingState message="Chargement de la fiche…" />
        )}
        {selected && (
          <div className="space-y-5">
            {error && <AlertBanner variant="error">{error}</AlertBanner>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-muted)]">Nom</p>
                <p className="font-medium">{selected.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Téléphone</p>
                <p>{selected.phone}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Email</p>
                <p>{selected.email}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">SIREN</p>
                <p>{selected.siren}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Rayon</p>
                <p>{selected.radius_km} km</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">
                  Missions réalisées
                </p>
                <p>{selected.completed_jobs}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Montant dû</p>
                <p className="font-semibold">{unpaidAmount.toFixed(2)} €</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-[var(--color-muted)]">
                Catégories
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.categories.map((category) => (
                  <Badge key={category} variant="accent">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-[var(--color-muted)]">
                Historique des missions
              </p>
              {history.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  Aucune mission enregistrée.
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((entry) => {
                    const claim = entry as {
                      id: string;
                      claimed_at: string | null;
                      created_at: string;
                      requests: {
                        city: string;
                        status: RequestStatus;
                        categories: { name: string } | { name: string }[] | null;
                      } | {
                        city: string;
                        status: RequestStatus;
                        categories: { name: string } | { name: string }[] | null;
                      }[] | null;
                    };
                    const request = Array.isArray(claim.requests)
                      ? claim.requests[0]
                      : claim.requests;
                    const categoryName = Array.isArray(request?.categories)
                      ? request.categories[0]?.name
                      : request?.categories?.name;

                    return (
                    <li
                      key={claim.id}
                      className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm dark:bg-white/[0.04]"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {categoryName ?? "Mission"}
                        </span>
                        <span>{request?.city}</span>
                        {request?.status && (
                          <RequestStatusBadge status={request.status} />
                        )}
                      </div>
                      <p className="mt-1 text-[var(--color-muted)]">
                        {claim.claimed_at
                          ? formatDateTimeFr(claim.claimed_at)
                          : formatDateFr(claim.created_at)}
                      </p>
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-[var(--color-muted)]">
                Historique des paiements
              </p>
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  Aucune facture enregistrée.
                </p>
              ) : (
                <ul className="space-y-2">
                  {paymentHistory.map((invoice) => (
                    <li
                      key={invoice.id}
                      className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm dark:bg-white/[0.04]"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {formatMonthFr(invoice.month)}
                        </span>
                        <span>
                          {invoice.mission_count} mission
                          {invoice.mission_count > 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold">
                          {formatEur(Number(invoice.amount))}
                        </span>
                        <InvoiceStatusBadge
                          invoiceSent={invoice.invoice_sent}
                          paid={invoice.paid}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Ajouter un professionnel"
        className="max-w-xl"
      >
        <div className="space-y-4">
          {error && <AlertBanner variant="error">{error}</AlertBanner>}
          <Input
            label="Nom complet"
            value={createForm.full_name}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                full_name: event.target.value,
              }))
            }
          />
          <Input
            label="Email"
            type="email"
            value={createForm.email}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
          <Input
            label="Téléphone"
            value={createForm.phone}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
          />
          <AddressAutocompleteField
            inputId="pro-address"
            label="Adresse"
            hint="Sélectionnez l'adresse dans la liste pour localiser automatiquement le professionnel."
            includeHiddenFields={false}
            selectedAddress={selectedAddress}
            error={addressError ?? undefined}
            onSelect={(address) => {
              setSelectedAddress(address);
              if (address) setAddressError(null);
            }}
          />
          <Input
            label="SIREN"
            value={createForm.siren}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                siren: event.target.value,
              }))
            }
          />
          <CategoryMultiSearchField
            inputId="pro-categories"
            categories={activeCategories}
            selectedCategories={selectedCategories}
            error={categoriesError ?? undefined}
            onChange={(categories) => {
              setSelectedCategories(categories);
              if (categories.length > 0) setCategoriesError(null);
            }}
          />
          <Input
            label="Rayon d'intervention (km)"
            type="number"
            min={1}
            value={createForm.radius_km}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                radius_km: event.target.value,
              }))
            }
          />
          <label className="flex items-center gap-3 text-sm text-[var(--color-card-foreground)]">
            <input
              type="checkbox"
              checked={createForm.active}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  active: event.target.checked,
                }))
              }
              className="h-5 w-5 rounded border-[var(--color-border)] accent-[var(--color-button)]"
              aria-label="Professionnel actif"
            />
            Professionnel actif
          </label>
          <Button onClick={handleCreate} disabled={isPending} className="w-full">
            Créer le professionnel
          </Button>
        </div>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Modifier le professionnel"
        className="max-w-xl"
      >
        <div className="space-y-4">
          {error && <AlertBanner variant="error">{error}</AlertBanner>}
          <Input
            label="Nom complet"
            value={form.full_name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                full_name: event.target.value,
              }))
            }
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <Input
            label="Téléphone"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
          <Input
            label="Adresse"
            value={form.address}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
          />
          <Input
            label="Ville"
            value={form.city}
            onChange={(event) =>
              setForm((current) => ({ ...current, city: event.target.value }))
            }
          />
          <Input
            label="SIREN"
            value={form.siren}
            onChange={(event) =>
              setForm((current) => ({ ...current, siren: event.target.value }))
            }
          />
          <Input
            label="Catégories (séparées par des virgules)"
            value={form.categories}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                categories: event.target.value,
              }))
            }
          />
          <Input
            label="Rayon d'intervention (km)"
            type="number"
            min={1}
            value={form.radius_km}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                radius_km: event.target.value,
              }))
            }
          />
          <Button onClick={handleSave} disabled={isPending} className="w-full">
            Enregistrer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
