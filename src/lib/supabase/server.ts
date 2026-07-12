import { getSupabaseClient } from "./client";

export async function getSupabaseServerClient() {
  return getSupabaseClient();
}
