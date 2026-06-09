import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CandidatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Professionnels candidats
        </h1>
        <p className="mt-1 text-sm opacity-80">
          Validation des nouvelles candidatures — à implémenter.
        </p>
      </div>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Mail</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty message="Aucun candidat en attente." />
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
