import type { SupabaseDbClient } from "@/types";
import { REQUEST_PHOTOS_BUCKET } from "@/lib/supabase/storage";

type Client = SupabaseDbClient;

export const photosService = {
  async listByRequest(client: Client, requestId: string) {
    return client
      .from("request_photos")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at");
  },

  async upload(
    client: Client,
    requestId: string,
    file: File,
    path: string
  ) {
    const { data: uploadData, error: uploadError } = await client.storage
      .from(REQUEST_PHOTOS_BUCKET)
      .upload(path, file, { upsert: false });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    return client.from("request_photos").insert({
      request_id: requestId,
      photo_url: uploadData.path,
    });
  },
};
