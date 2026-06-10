import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceKm } from "@/utils/distance";

interface ProRequestDetailsProps {
  categoryName: string;
  distanceKm: number;
  description: string;
}

export function ProRequestDetails({
  categoryName,
  distanceKm,
  description,
}: ProRequestDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Détails de la demande</CardTitle>
          <Badge variant="accent">{categoryName}</Badge>
        </div>
        <CardDescription>
          Distance estimée : {formatDistanceKm(distanceKm)}
        </CardDescription>
      </CardHeader>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-card-foreground)]">
        {description}
      </p>
    </Card>
  );
}
