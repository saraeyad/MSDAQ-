import type { AuthUser } from "@/context/types";
import type { GeneratedAudio, Transcript, User } from "@/types";

export type VoiceAsset = GeneratedAudio | Transcript;

export interface VoiceAssetOwnerFields {
  user_id?: number | null;
  created_by?: Pick<User, "id" | "name"> | null;
}

export function voiceAssetOwnerId(
  asset: VoiceAssetOwnerFields,
): number | null {
  if (asset.user_id != null) return asset.user_id;
  return asset.created_by?.id ?? null;
}

/** Save / promote / rename — owner only. */
export function canSaveVoiceAsset(
  asset: VoiceAssetOwnerFields,
  user: AuthUser | null | undefined,
  /** True when the asset was just generated in this session by the current user. */
  isSessionOwner = false,
): boolean {
  if (!user) return false;
  if (isSessionOwner) return true;
  const ownerId = voiceAssetOwnerId(asset);
  if (ownerId == null) return false;
  return ownerId === user.id;
}

/** Delete — owner or super-admin. */
export function canDeleteVoiceAsset(
  asset: VoiceAssetOwnerFields,
  user: AuthUser | null | undefined,
  isSuperAdmin: boolean,
  isSessionOwner = false,
): boolean {
  if (!user) return false;
  if (isSuperAdmin) return true;
  if (isSessionOwner) return true;
  const ownerId = voiceAssetOwnerId(asset);
  if (ownerId == null) return false;
  return ownerId === user.id;
}

export function formatVoiceAssetSavedMeta(
  asset: Pick<GeneratedAudio | Transcript, "saved_by" | "saved_at">,
): string | null {
  const parts: string[] = [];
  if (asset.saved_by) parts.push(asset.saved_by);
  if (asset.saved_at) {
    parts.push(new Date(asset.saved_at).toLocaleDateString("ar"));
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
