import { useAuth } from "@/context/auth";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { resolveMediaUrl } from "@/lib/media-url";
import {
  canDeleteVoiceAsset,
  canSaveVoiceAsset,
} from "@/lib/voice-asset-access";
import { ToolsVoice_APIs } from "@/services/api/tools";
import type { GeneratedAudio } from "@/types";
import { VoiceAssetLibraryPage } from "../components/VoiceAssetLibraryPage";
import { VoiceAssetRow } from "../components/VoiceAssetRow";

function AudioLibraryRow({
  item,
  canRename,
  canDelete,
  onDelete,
  onRenamed,
  isDeleting,
}: {
  item: GeneratedAudio;
  canRename: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onRenamed: () => void;
  isDeleting: boolean;
}) {
  const audioUrl = resolveMediaUrl(item.audio_url) ?? item.audio_url;

  return (
    <VoiceAssetRow
      title={item.name ?? `ملف #${item.id}`}
      meta={
        <>
          {item.voice}
          {item.saved_by ? ` · ${item.saved_by}` : ""}
          {item.saved_at
            ? ` · ${new Date(item.saved_at).toLocaleDateString("ar")}`
            : ""}
        </>
      }
      canRename={canRename}
      canDelete={canDelete}
      onDelete={onDelete}
      onRename={async (name) => {
        await ToolsVoice_APIs.saveGeneratedAudio(item.id, { name });
        onRenamed();
      }}
      isDeleting={isDeleting}
    >
      <audio controls src={audioUrl} className="w-full" />
    </VoiceAssetRow>
  );
}

export function GeneratedAudiosLibraryPage() {
  const { user } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();

  return (
    <VoiceAssetLibraryPage
      title="مكتبة الملفات الصوتية"
      queryKey={["generated-audios"]}
      emptyMessage="لا توجد ملفات صوتية محفوظة بعد"
      fetchPage={(page) => ToolsVoice_APIs.listGeneratedAudios(page)}
      deleteItem={(id) => ToolsVoice_APIs.deleteGeneratedAudio(id)}
      getDeleteLabel={(item) => item.name ?? `#${item.id}`}
      canRename={(item) => canSaveVoiceAsset(item, user)}
      canDelete={(item) => canDeleteVoiceAsset(item, user, isSuperAdmin)}
      renderItem={(props) => <AudioLibraryRow key={props.item.id} {...props} />}
    />
  );
}
