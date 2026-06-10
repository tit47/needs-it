import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Professional } from "@/types";
import { calculateDistanceKm } from "@/utils/distance";

type Client = SupabaseClient<Database>;

export type MatchedProfessional = {
  professional: Professional;
  distanceKm: number;
};

export const matchingService = {
  async findMatchingProfessionals(
    client: Client,
    categoryName: string,
    latitude: number,
    longitude: number
  ): Promise<MatchedProfessional[]> {
    const { data: professionals, error } = await client
      .from("professionals")
      .select("*")
      .eq("active", true)
      .contains("categories", [categoryName]);

    if (error || !professionals?.length) {
      return [];
    }

    const matches: MatchedProfessional[] = [];

    for (const professional of professionals) {
      if (professional.latitude == null || professional.longitude == null) {
        continue;
      }

      const distanceKm = calculateDistanceKm(
        latitude,
        longitude,
        professional.latitude,
        professional.longitude
      );

      if (distanceKm <= professional.radius_km) {
        matches.push({ professional, distanceKm });
      }
    }

    return matches.sort((a, b) => a.distanceKm - b.distanceKm);
  },
};
