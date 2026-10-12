import { useAuth } from "@/context/auth";
import { useIsSuperAdmin } from "@/hooks/auth";
import { resolveMediaUrl } from "@/lib/media";
import {
  canDeleteVoiceAsset,
  canSaveVoiceAsset,
} from "@/lib/media";
import { ToolsVoice_APIs, Tts_APIs } from "@/services/api/tools";
import type { GeneratedAudio, TtsVoice } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { VoiceAssetLibraryPage } from "../components/VoiceAssetLibraryPage";
import { VoiceAssetRow } from "../components/VoiceAssetRow";

function ttsVoiceLabel(slug: string, voices: TtsVoice[] | undefined): string {
  return voices?.find((v) => v.slug === slug)?.name ?? slug;
}

function AudioLibraryRow({
  item,
  canRename,
  canDelete,
  onDelete,
  onRenamed,
  isDeleting,
  voiceLabel,
}: {
  item: GeneratedAudio;
  canRename: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onRenamed: () => void;
  isDeleting: boolean;
  voiceLabel: string;
}) {
  const audioUrl =
    item.audio_url != null
      ? (resolveMediaUrl(item.audio_url) ?? item.audio_url)
      : null;

  return (
    <VoiceAssetRow
      title={item.name ?? `ملف #${item.id}`}
      meta={
        <>
          {voiceLabel}
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
      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full" />
      ) : (
        <p className="text-sm text-muted-foreground">لا يوجد رابط صوتي</p>
      )}
    </VoiceAssetRow>
  );
}

export function GeneratedAudiosLibraryPage() {
  const { user } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();
  const { data: voices } = useQuery({
    queryKey: ["tts-voices"],
    queryFn: Tts_APIs.getVoices,
  });

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
      renderItem={(props) => (
        <AudioLibraryRow
          key={props.item.id}
          {...props}
          voiceLabel={ttsVoiceLabel(props.item.voice, voices)}
        />
      )}
    />
  );
}
