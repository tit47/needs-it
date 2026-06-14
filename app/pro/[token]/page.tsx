import {
  ProClaimForm,
  ProClientContact,
  ProMissionActive,
  ProPhotoGallery,
  ProRequestDetails,
  ProUnavailableState,
} from "@/components/pro";
import { ProPageHeader } from "@/components/layout/pro-page-header";
import { SkipLink } from "@/components/layout/skip-link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSignedPhotoUrls } from "@/lib/supabase/storage";
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
    const photoUrls = await createSignedPhotoUrls(client, view.requestPhotos);

    return (
      <ProPageShell title="Mission confirmée">
        <div className="flex flex-col gap-6">
          <ProRequestDetails
            categoryName={view.categoryName}
            distanceKm={view.distanceKm}
            description={view.description}
          />
          <ProPhotoGallery photoUrls={photoUrls} />
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

  const photoUrls = await createSignedPhotoUrls(client, view.requestPhotos);

  return (
    <ProPageShell title="Nouvelle demande">
      <div className="flex flex-col gap-6">
        <ProRequestDetails
          categoryName={view.categoryName}
          distanceKm={view.distanceKm}
          description={view.description}
        />
        <ProPhotoGallery photoUrls={photoUrls} />
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
    <>
      <SkipLink />
      <main id="main-content" className="min-h-screen px-4 py-8">
        <div className="mx-auto flex max-w-lg flex-col gap-8">
          <ProPageHeader title={title} />
          {children}
        </div>
      </main>
    </>
  );
}
