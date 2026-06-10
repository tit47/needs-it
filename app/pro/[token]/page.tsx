import {
  ProClaimForm,
  ProClientContact,
  ProMissionActive,
  ProPhotoGallery,
  ProRequestDetails,
  ProUnavailableState,
} from "@/components/pro";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveProPageView } from "@/services/pro-workflow.service";

interface ProPageProps {
  params: Promise<{ token: string }>;
}

export default async function ProPage({ params }: ProPageProps) {
  const { token } = await params;
  const client = createAdminClient();
  const view = await resolveProPageView(client, token);

  if (view.kind === "not_found") {
    return (
      <ProPageShell title="Lien invalide">
        <ProUnavailableState
          title="Lien introuvable"
          description="Ce lien n'est plus valide ou a expiré."
        />
      </ProPageShell>
    );
  }

  if (view.kind === "mission_taken") {
    return (
      <ProPageShell title="Mission attribuée">
        <ProUnavailableState
          title="Mission déjà attribuée"
          description={`La demande ${view.categoryName} a déjà été prise par un autre professionnel.`}
        />
      </ProPageShell>
    );
  }

  if (view.kind === "unavailable") {
    return (
      <ProPageShell title="Demande indisponible">
        <ProUnavailableState
          title="Demande indisponible"
          description={view.message}
        />
      </ProPageShell>
    );
  }

  if (view.kind === "claimed_by_you") {
    return (
      <ProPageShell title="Mission confirmée">
        <div className="flex flex-col gap-6">
          <ProRequestDetails
            categoryName={view.categoryName}
            distanceKm={view.distanceKm}
            description={view.description}
          />
          <ProPhotoGallery photoUrls={view.photoUrls} />
          <ProClientContact
            clientName={view.clientName}
            clientPhone={view.clientPhone}
            clientAddress={view.clientAddress}
            city={view.city}
            showAddress
          />
          <ProMissionActive token={token} />
        </div>
      </ProPageShell>
    );
  }

  return (
    <ProPageShell title="Nouvelle demande">
      <div className="flex flex-col gap-6">
        <ProRequestDetails
          categoryName={view.categoryName}
          distanceKm={view.distanceKm}
          description={view.description}
        />
        <ProPhotoGallery photoUrls={view.photoUrls} />
        <ProClientContact
          clientName={view.clientName}
          clientPhone={view.clientPhone}
        />
        <ProClaimForm token={token} />
      </div>
    </ProPageShell>
  );
}

function ProPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide opacity-80">
            Need&apos;s it
          </p>
          <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        </header>
        {children}
      </div>
    </main>
  );
}
