import {
  getSupabaseClient,
  hasSupabaseConfig as hasSupabaseConfigFromClient,
} from "@/lib/supabase";

export const hasSupabaseConfig = hasSupabaseConfigFromClient;

export type CloudCardKind = "learning" | "knowledge" | "reading";

export interface CloudCardRecord {
  id: string;
  kind: CloudCardKind;
  title: string;
  content?: string | null;
  summary?: string | null;
  category?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string | null;
  last_opened_at?: string | null;
  current_page?: number | null;
  progress_percentage?: number | null;
  favorite?: boolean | null;
  recently_viewed?: boolean | null;
}

export interface CloudFileRecord {
  id: string;
  card_id: string;
  kind: CloudCardKind;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url?: string | null;
  created_at?: string;
  user_id?: string | null;
}

const tableNameByKind: Record<CloudCardKind, string> = {
  learning: "learning_cards",
  knowledge: "knowledge_cards",
  reading: "reading_cards",
};
const storageBuckets: Record<CloudCardKind, string> = {
  learning: "learning-files",
  knowledge: "knowledge-files",
  reading: "reading-files",
};

function getStorageBucket(kind: CloudCardKind) {
  return storageBuckets[kind] ?? "growthos-files";
}

function getUserId() {
  if (typeof window === "undefined") {
    return "local";
  }

  const existing = window.localStorage.getItem("growthos-user-id");
  if (existing) {
    return existing;
  }

  const next = `local-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem("growthos-user-id", next);
  return next;
}

function normalizeMetadata(metadata?: Record<string, unknown> | null) {
  if (!metadata || typeof metadata !== "object") {
    return {} as Record<string, unknown>;
  }

  return metadata;
}

function parseStoredCardDescription(description?: string | null) {
  const fallbackText = typeof description === "string" ? description : "";

  if (!description) {
    return {
      notes: "",
      progressPercentage: 0,
      currentPage: 1,
      lastOpenedAt: null as string | null,
      favorite: false,
      category: null as string | null,
      tags: [] as string[],
    };
  }

  try {
    const parsed = JSON.parse(description) as Record<string, unknown>;
    if (parsed && typeof parsed === "object") {
      const notes = typeof parsed.notes === "string" ? parsed.notes : fallbackText;
      const progressPercentage =
        typeof parsed.progressPercentage === "number"
          ? parsed.progressPercentage
          : typeof parsed.progress_percentage === "number"
            ? parsed.progress_percentage
            : 0;
      const currentPage =
        typeof parsed.currentPage === "number"
          ? parsed.currentPage
          : typeof parsed.current_page === "number"
            ? parsed.current_page
            : 1;
      const lastOpenedAt =
        typeof parsed.lastOpenedAt === "string"
          ? parsed.lastOpenedAt
          : typeof parsed.last_opened_at === "string"
            ? parsed.last_opened_at
            : null;
      const favorite = typeof parsed.favorite === "boolean" ? parsed.favorite : false;
      const category = typeof parsed.category === "string" ? parsed.category : null;
      const tags = Array.isArray(parsed.tags)
        ? parsed.tags.filter((tag): tag is string => typeof tag === "string")
        : [];

      return {
        notes,
        progressPercentage,
        currentPage,
        lastOpenedAt,
        favorite,
        category,
        tags,
      };
    }
  } catch {
    // fall back to the raw description text for human-readable notes
  }

  return {
    notes: fallbackText,
    progressPercentage: 0,
    currentPage: 1,
    lastOpenedAt: null as string | null,
    favorite: false,
    category: null as string | null,
    tags: [] as string[],
  };
}

function serializeStoredCardDescription(notes: string, metadata: Record<string, unknown> = {}) {
  const progressPercentage =
    typeof metadata.progress_percentage === "number"
      ? metadata.progress_percentage
      : typeof metadata.progress === "number"
        ? metadata.progress
        : 0;
  const currentPage =
    typeof metadata.current_page === "number"
      ? metadata.current_page
      : typeof metadata.current === "number"
        ? metadata.current
        : 1;
  const lastOpenedAt =
    typeof metadata.lastOpenedAt === "string"
      ? metadata.lastOpenedAt
      : typeof metadata.last_opened_at === "string"
        ? metadata.last_opened_at
        : null;
  const favorite = typeof metadata.favorite === "boolean" ? metadata.favorite : false;
  const category = typeof metadata.category === "string" ? metadata.category : null;
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return JSON.stringify({
    notes,
    progressPercentage,
    currentPage,
    lastOpenedAt,
    favorite,
    category,
    tags,
  });
}

function normalizeCloudCardRecord(record: Record<string, unknown>, kind: CloudCardKind) {
  const parsedDescription = parseStoredCardDescription(
    typeof record.description === "string" ? record.description : null,
  );

  return {
    ...record,
    kind,
    content: parsedDescription.notes,
    summary: parsedDescription.notes,
    category: typeof record.category === "string" ? record.category : parsedDescription.category,
    metadata: {
      notes: parsedDescription.notes,
      progressPercentage: parsedDescription.progressPercentage,
      currentPage: parsedDescription.currentPage,
      lastOpenedAt: parsedDescription.lastOpenedAt,
      favorite: parsedDescription.favorite,
      tags: parsedDescription.tags,
      status: typeof record.status === "string" ? record.status : "active",
    },
    favorite: typeof record.favorite === "boolean" ? record.favorite : parsedDescription.favorite,
    progress_percentage: parsedDescription.progressPercentage,
    current_page: parsedDescription.currentPage,
    last_opened_at:
      typeof record.last_opened_at === "string"
        ? record.last_opened_at
        : (parsedDescription.lastOpenedAt ?? undefined),
  } as CloudCardRecord;
}

function isSupportedUploadFile(file: File) {
  const mimeType = file.type?.toLowerCase() ?? "";
  const fileName = file.name.toLowerCase();

  if (mimeType.startsWith("image/")) {
    return true;
  }

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    return true;
  }

  if (mimeType.includes("wordprocessingml") || fileName.endsWith(".docx")) {
    return true;
  }

  if (
    mimeType.startsWith("text/") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown")
  ) {
    return true;
  }

  return false;
}

function withDefaultCardMetadata(payload: Partial<CloudCardRecord> & { title: string }) {
  const { content, metadata, ...restPayload } = payload;
  const normalizedMetadata = normalizeMetadata(metadata);
  const notes = typeof content === "string" ? content : "";
  const now = new Date().toISOString();

  return {
    ...restPayload,
    title: payload.title,
    created_at: restPayload.created_at ?? now,
    updated_at: restPayload.updated_at ?? now,
    description: serializeStoredCardDescription(notes, {
      ...normalizedMetadata,
      favorite: restPayload.favorite ?? normalizedMetadata.favorite ?? false,
      recently_viewed: restPayload.recently_viewed ?? normalizedMetadata.recently_viewed ?? true,
      progress_percentage:
        restPayload.progress_percentage ??
        normalizedMetadata.progress_percentage ??
        normalizedMetadata.progress ??
        0,
      current_page: restPayload.current_page ?? normalizedMetadata.current_page ?? 1,
      status: normalizedMetadata.status ?? "active",
      category: normalizedMetadata.category ?? restPayload.category ?? null,
      tags: normalizedMetadata.tags ?? [],
    }),
    category: (restPayload.category ?? normalizedMetadata.category ?? null) as string | null,
    tags: Array.isArray(normalizedMetadata.tags)
      ? normalizedMetadata.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    favorite: restPayload.favorite ?? normalizedMetadata.favorite ?? false,
    status: (normalizedMetadata.status as string | undefined) ?? "active",
    last_opened_at: restPayload.last_opened_at ?? normalizedMetadata.last_opened_at ?? now,
  };
}

export async function listCloudCards(kind: CloudCardKind) {
  if (!hasSupabaseConfig) {
    return [] as CloudCardRecord[];
  }

  const client = getSupabaseClient();
  if (!client) {
    return [] as CloudCardRecord[];
  }

  const { data, error } = await client
    .from(tableNameByKind[kind])
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("Failed to load cloud cards", error.message);
    return [] as CloudCardRecord[];
  }

  return (data ?? []).map((record) =>
    normalizeCloudCardRecord(record as Record<string, unknown>, kind),
  );
}

export async function upsertCloudCard(
  kind: CloudCardKind,
  payload: Partial<CloudCardRecord> & { title: string },
) {
  if (!hasSupabaseConfig) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const normalizedPayload = withDefaultCardMetadata(payload);
  const { data, error } = await client
    .from(tableNameByKind[kind])
    .upsert(normalizedPayload)
    .select()
    .single();

  if (error) {
    console.warn("Failed to save cloud card", error.message);
    return null;
  }

  return data as CloudCardRecord | null;
}

export async function updateCloudCardProgress(
  kind: CloudCardKind,
  id: string,
  updates: Partial<CloudCardRecord>,
) {
  if (!hasSupabaseConfig) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const now = new Date().toISOString();
  const metadata = normalizeMetadata((updates.metadata ?? {}) as Record<string, unknown>);
  const existingCard = await client
    .from(tableNameByKind[kind])
    .select("id, description, category, tags, favorite, status, last_opened_at")
    .eq("id", id)
    .maybeSingle();
  const existingDescription = parseStoredCardDescription(
    existingCard.data && typeof existingCard.data.description === "string"
      ? existingCard.data.description
      : null,
  );
  const nextDescription = serializeStoredCardDescription(existingDescription.notes, {
    ...metadata,
    progress_percentage:
      updates.progress_percentage ??
      existingDescription.progressPercentage ??
      metadata.progress_percentage ??
      metadata.progress ??
      0,
    current_page:
      updates.current_page ?? existingDescription.currentPage ?? metadata.current_page ?? 1,
    favorite: updates.favorite ?? existingDescription.favorite ?? metadata.favorite ?? false,
    recently_viewed: updates.recently_viewed ?? metadata.recently_viewed ?? true,
    lastOpenedAt: updates.last_opened_at ?? existingDescription.lastOpenedAt ?? now,
    category: existingDescription.category ?? metadata.category ?? null,
    tags: existingDescription.tags ?? [],
  });

  const { data, error } = await client
    .from(tableNameByKind[kind])
    .update({
      updated_at: now,
      last_opened_at: updates.last_opened_at ?? existingDescription.lastOpenedAt ?? now,
      favorite: updates.favorite ?? existingDescription.favorite ?? false,
      description: nextDescription,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.warn("Failed to update cloud card progress", error.message);
    return null;
  }

  if (kind === "reading") {
    const progressPayload: Record<string, unknown> = {
      card_id: id,
      updated_at: now,
    };

    if (updates.last_opened_at !== undefined) {
      progressPayload.last_opened_at = updates.last_opened_at;
    }
    if (updates.current_page !== undefined) {
      progressPayload.current_page = updates.current_page;
    }
    if (updates.progress_percentage !== undefined) {
      progressPayload.progress_percentage = updates.progress_percentage;
    }
    if (updates.favorite !== undefined) {
      progressPayload.favorite = updates.favorite;
    }

    const existing = await client
      .from("reading_progress")
      .select("id")
      .eq("card_id", id)
      .maybeSingle();

    if (existing.error) {
      console.warn("Failed to read reading progress", existing.error.message);
    } else if (existing.data) {
      const { error: progressError } = await client
        .from("reading_progress")
        .update(progressPayload)
        .eq("card_id", id);
      if (progressError) {
        console.warn("Failed to update reading progress", progressError.message);
      }
    } else {
      const { error: progressError } = await client.from("reading_progress").insert({
        ...progressPayload,
        created_at: now,
      });
      if (progressError) {
        console.warn("Failed to insert reading progress", progressError.message);
      }
    }
  }

  return data as CloudCardRecord | null;
}

export async function deleteCloudCard(kind: CloudCardKind, id: string) {
  if (!hasSupabaseConfig) {
    return false;
  }

  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const { error } = await client.from(tableNameByKind[kind]).delete().eq("id", id);
  if (error) {
    console.warn("Failed to delete cloud card", error.message);
    return false;
  }
  return true;
}

export async function uploadCloudFile(kind: CloudCardKind, cardId: string, file: File) {
  if (!hasSupabaseConfig) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const safeName = file.name.replace(/\s+/g, "-");
  const filePath = `${kind}/${cardId}/${Date.now()}-${safeName}`;
  if (!isSupportedUploadFile(file)) {
    console.warn("Unsupported file upload type", file.name, file.type);
    return null;
  }

  const { error: uploadError } = await client.storage
    .from(getStorageBucket(kind))
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.warn("Failed to upload file", uploadError.message);
    return null;
  }

  let signedUrl = "";
  try {
    const { data: signedData } = await client.storage
      .from(getStorageBucket(kind))
      .createSignedUrl(filePath, 60 * 60);
    signedUrl = signedData?.signedUrl ?? "";
  } catch (error) {
    console.warn("Unable to create signed URL", error);
  }

  const { data: recordData, error: recordError } = await client
    .from("card_files")
    .insert({
      card_id: cardId,
      kind,
      file_name: file.name,
      file_type: file.type || "application/octet-stream",
      file_size: file.size,
      storage_path: filePath,
      public_url: signedUrl || "",
      user_id: getUserId(),
    })
    .select()
    .single();

  if (recordError) {
    console.warn("Failed to save file record", recordError.message);
    return null;
  }

  return recordData as CloudFileRecord | null;
}

export async function renameCloudFile(id: string, newName: string) {
  if (!hasSupabaseConfig) {
    return false;
  }

  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const { error } = await client.from("card_files").update({ file_name: newName }).eq("id", id);
  if (error) {
    console.warn("Failed to rename file", error.message);
    return false;
  }

  return true;
}

export async function replaceCloudFile(id: string, file: File) {
  if (!hasSupabaseConfig) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data: existingFile, error: lookupError } = await client
    .from("card_files")
    .select("storage_path, kind")
    .eq("id", id)
    .single();
  if (lookupError || !existingFile?.storage_path) {
    return null;
  }

  const safeName = file.name.replace(/\s+/g, "-");
  const updatedPath = existingFile.storage_path.replace(/[^/]+$/, safeName);
  const { error: uploadError } = await client.storage
    .from(getStorageBucket(existingFile.kind ?? "learning"))
    .upload(updatedPath, file, {
      cacheControl: "3600",
      upsert: true,
    });
  if (uploadError) {
    console.warn("Failed to replace file", uploadError.message);
    return null;
  }

  const { data: recordData, error: recordError } = await client
    .from("card_files")
    .update({
      file_name: file.name,
      file_type: file.type || "application/octet-stream",
      file_size: file.size,
      storage_path: updatedPath,
    })
    .eq("id", id)
    .select()
    .single();

  if (recordError) {
    console.warn("Failed to update replaced file", recordError.message);
    return null;
  }

  return recordData as CloudFileRecord | null;
}

export async function listCloudFiles(kind: CloudCardKind, cardId: string) {
  if (!hasSupabaseConfig) {
    return [] as CloudFileRecord[];
  }

  const client = getSupabaseClient();
  if (!client) {
    return [] as CloudFileRecord[];
  }

  const { data, error } = await client
    .from("card_files")
    .select("*")
    .eq("kind", kind)
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("Failed to load file records", error.message);
    return [] as CloudFileRecord[];
  }

  return (data ?? []) as CloudFileRecord[];
}

export async function getCloudFileDownloadUrl(file: CloudFileRecord) {
  if (!hasSupabaseConfig) {
    return file.public_url ?? "";
  }

  const client = getSupabaseClient();
  if (!client) {
    return file.public_url ?? "";
  }

  if (file.public_url) {
    return file.public_url;
  }

  const { data, error } = await client.storage
    .from(getStorageBucket(file.kind))
    .createSignedUrl(file.storage_path, 60 * 60);
  if (error) {
    console.warn("Failed to create signed URL", error.message);
    return file.public_url ?? "";
  }

  return data?.signedUrl ?? file.public_url ?? "";
}

export async function deleteCloudFile(id: string) {
  if (!hasSupabaseConfig) {
    return false;
  }

  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const { data, error } = await client
    .from("card_files")
    .select("storage_path, kind")
    .eq("id", id)
    .single();
  if (error || !data?.storage_path) {
    return false;
  }

  const { error: deleteError } = await client.storage
    .from(getStorageBucket((data.kind as CloudCardKind) ?? "learning"))
    .remove([data.storage_path]);
  if (deleteError) {
    console.warn("Failed to remove storage object", deleteError.message);
    return false;
  }

  const { error: recordError } = await client.from("card_files").delete().eq("id", id);
  if (recordError) {
    console.warn("Failed to remove file record", recordError.message);
    return false;
  }

  return true;
}
