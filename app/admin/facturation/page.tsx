import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FacturationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Facturation
        </h1>
        <p className="mt-1 text-sm opacity-80">
          Suivi mensuel des missions et paiements — à implémenter.
        </p>
      </div>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Professionnel</TableHead>
              <TableHead>Missions</TableHead>
              <TableHead>Montant dû</TableHead>
              <TableHead>Facture envoyée</TableHead>
              <TableHead>Payée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty message="Aucune facture pour le moment." />
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
