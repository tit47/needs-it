import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProfessionnelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Professionnels
        </h1>
        <p className="mt-1 text-sm opacity-80">
          Gestion du réseau de professionnels — à implémenter.
        </p>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty message="Aucun professionnel enregistré." />
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
