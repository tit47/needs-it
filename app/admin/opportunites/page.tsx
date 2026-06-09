import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OpportunitesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Opportunités
        </h1>
        <p className="mt-1 text-sm opacity-80">
          Zones et catégories à renforcer — à implémenter.
        </p>
      </div>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ville</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Demandes</TableHead>
              <TableHead>Satisfaites</TableHead>
              <TableHead>Couverture</TableHead>
              <TableHead>Priorité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty message="Aucune opportunité identifiée." />
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
