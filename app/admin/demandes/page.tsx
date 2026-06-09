import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DemandesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Demandes
        </h1>
        <p className="mt-1 text-sm opacity-80">
          Suivi de toutes les demandes clients — à implémenter.
        </p>
      </div>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Professionnel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty message="Aucune demande pour le moment." />
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
