export interface BanAddress {
  id: string;
  label: string;
  name: string;
  postcode: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  city: string;
  label: string;
  postcode: string;
}

interface BanApiFeature {
  properties: {
    id: string;
    label: string;
    name: string;
    postcode: string;
    city: string;
    score: number;
  };
  geometry: {
    coordinates: [number, number];
  };
}

function mapBanFeature(feature: BanApiFeature): BanAddress {
  const [longitude, latitude] = feature.geometry.coordinates;

  return {
    id: feature.properties.id,
    label: feature.properties.label,
    name: feature.properties.name,
    postcode: feature.properties.postcode,
    city: feature.properties.city,
    latitude,
    longitude,
  };
}

export async function searchBanAddresses(
  query: string,
  limit = 6
): Promise<BanAddress[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = new URL("https://api-adresse.data.gouv.fr/search/");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("autocomplete", "1");

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) return [];

  const data = (await response.json()) as { features: BanApiFeature[] };
  return (data.features ?? []).map(mapBanFeature);
}

export async function verifyBanAddress(
  id: string,
  label: string
): Promise<BanAddress | null> {
  const results = await searchBanAddresses(label, 8);
  return results.find((item) => item.id === id) ?? null;
}

/** Conservé pour d'éventuels usages serveur — ne pas utiliser pour valider une saisie libre. */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  const results = await searchBanAddresses(address, 1);
  const match = results[0];
  if (!match) return null;

  return {
    latitude: match.latitude,
    longitude: match.longitude,
    city: match.city,
    label: match.label,
    postcode: match.postcode,
  };
}
