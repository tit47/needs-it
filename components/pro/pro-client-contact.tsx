import { Phone } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPhoneDisplay } from "@/utils/phone";

interface ProClientContactProps {
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  city?: string;
  showAddress?: boolean;
}

export function ProClientContact({
  clientName,
  clientPhone,
  clientAddress,
  city,
  showAddress = false,
}: ProClientContactProps) {
  const phoneHref = clientPhone.replace(/[^\d+]/g, "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coordonnées client</CardTitle>
        <CardDescription>
          {showAddress
            ? "Adresse complète disponible — mission confirmée."
            : "Appelez le client pour obtenir le code mission. L'adresse reste masquée."}
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-[var(--color-muted)]">Nom</p>
          <p className="text-base font-semibold">{clientName}</p>
        </div>

        <div>
          <p className="text-sm text-[var(--color-muted)]">Téléphone</p>
          <a
            href={`tel:${phoneHref}`}
            className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--color-card-foreground)] underline-offset-4 hover:underline"
          >
            <Phone className="h-5 w-5" />
            {formatPhoneDisplay(clientPhone)}
          </a>
        </div>

        {showAddress && clientAddress && (
          <div>
            <p className="text-sm text-[var(--color-muted)]">Adresse</p>
            <p className="text-base font-semibold">
              {clientAddress}
              {city ? `, ${city}` : ""}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
