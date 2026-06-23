import Link from "next/link";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  buildCategorySearchUrl,
  getMetierSlugByName,
  type MetierSeoRecord,
} from "@/lib/seo/metiers";

interface MetierPageContentProps {
  metier: MetierSeoRecord;
}

function MetierLink({ name }: { name: string }) {
  const slug = getMetierSlugByName(name);
  if (!slug) {
    return <span>{name}</span>;
  }

  return (
    <Link href={`/${slug}`} className="legal-link">
      {name}
    </Link>
  );
}

export function MetierPageContent({ metier }: MetierPageContentProps) {
  const faqItems = [
    {
      question: `Quel est le prix d'un ${metier.metier} ?`,
      answer: `Le prix d'un ${metier.metier} dépend de la nature des travaux, de leur complexité et de la région. Les prestations courantes telles que ${metier.prix[0].nom}, ${metier.prix[1].nom}, ${metier.prix[2].nom} ou ${metier.prix[3].nom} coûtent généralement entre ${metier.prix[0].prix}, ${metier.prix[1].prix}, ${metier.prix[2].prix} et ${metier.prix[3].prix}.`,
    },
    {
      question: "Puis-je envoyer des photos ?",
      answer:
        "Oui, vous pouvez joindre des photos pour aider les professionnels à mieux comprendre votre besoin.",
    },
    {
      question: "Sous combien de temps serai-je contacté ?",
      answer:
        "Les professionnels proches correspondant à la catégorie choisie sont alertés immédiatement.",
    },
    {
      question: "Les devis sont-ils gratuits ?",
      answer: "Cela dépend du professionnel et de la nature de l'intervention.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <SeoBreadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Métiers", href: "/metiers" },
          { label: metier.metier },
        ]}
      />

      <Card padding="lg">
        <article className="legal-prose">
          <h1>Trouver un {metier.metier} rapidement</h1>

          <p>{metier.intro}</p>

          <h2>Pour quels travaux faire appel à un {metier.metier} ?</h2>
          <ul>
            {metier.travaux.map((travail) => (
              <li key={travail}>{travail}</li>
            ))}
          </ul>

          <h2>Prix généralement constatés</h2>
          <div className="legal-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Intervention</th>
                  <th>Prix moyen</th>
                </tr>
              </thead>
              <tbody>
                {metier.prix.map((item) => (
                  <tr key={item.nom}>
                    <td>{item.nom}</td>
                    <td>{item.prix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Les tarifs varient selon la région, la complexité des travaux et le
            professionnel.
          </p>

          <h2>Durée moyenne d&apos;intervention</h2>
          <p>
            <strong>Petite intervention :</strong> {metier.duree.petite}
          </p>
          <p>
            <strong>Intervention classique :</strong> {metier.duree.classique}
          </p>
          <p>
            <strong>Gros chantier :</strong> {metier.duree.importante}
          </p>

          <h2>Comment fonctionne Need&apos;s it ?</h2>
          <ol>
            <li>Choisissez le métier recherché.</li>
            <li>Décrivez votre besoin.</li>
            <li>Ajoutez éventuellement des photos.</li>
            <li>
              Seuls les professionnels correspondant à cette catégorie sont
              alertés.
            </li>
            <li>Un professionnel accepte la demande.</li>
            <li>Il vous contacte.</li>
            <li>Il valide votre code à 4 chiffres.</li>
            <li>Les coordonnées sont débloquées.</li>
            <li>La prestation peut être réalisée.</li>
          </ol>

          <h2>Questions fréquentes</h2>
          {faqItems.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}

          <h2>Autres professionnels</h2>
          <ul>
            {metier.metiersProches.map((name) => (
              <li key={name}>
                <MetierLink name={name} />
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <Link href={buildCategorySearchUrl(metier.metier)}>
              <Button size="lg" className="w-full sm:w-auto">
                Trouver un {metier.metier}
              </Button>
            </Link>
          </div>
        </article>
      </Card>
    </div>
  );
}

export function getMetierFaqItems(metier: MetierSeoRecord) {
  return [
    {
      question: `Quel est le prix d'un ${metier.metier} ?`,
      answer: `Le prix d'un ${metier.metier} dépend de la nature des travaux, de leur complexité et de la région. Les prestations courantes telles que ${metier.prix[0].nom}, ${metier.prix[1].nom}, ${metier.prix[2].nom} ou ${metier.prix[3].nom} coûtent généralement entre ${metier.prix[0].prix}, ${metier.prix[1].prix}, ${metier.prix[2].prix} et ${metier.prix[3].prix}.`,
    },
    {
      question: "Puis-je envoyer des photos ?",
      answer:
        "Oui, vous pouvez joindre des photos pour aider les professionnels à mieux comprendre votre besoin.",
    },
    {
      question: "Sous combien de temps serai-je contacté ?",
      answer:
        "Les professionnels proches correspondant à la catégorie choisie sont alertés immédiatement.",
    },
    {
      question: "Les devis sont-ils gratuits ?",
      answer: "Cela dépend du professionnel et de la nature de l'intervention.",
    },
  ];
}
