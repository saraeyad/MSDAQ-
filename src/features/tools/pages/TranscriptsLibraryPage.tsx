import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import {
  canDeleteVoiceAsset,
  canSaveVoiceAsset,
} from "@/lib/voice-asset-access";
import { Transcripts_APIs } from "@/services/api/transcripts";
import type { Transcript } from "@/types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { VoiceAssetLibraryPage } from "../components/VoiceAssetLibraryPage";
import { VoiceAssetRow } from "../components/VoiceAssetRow";

function TranscriptRow({
  item,
  canRename,
  canDelete,
  onDelete,
  onRenamed,
  isDeleting,
}: {
  item: Transcript;
  canRename: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onRenamed: () => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <VoiceAssetRow
      title={item.name ?? item.original_filename}
      meta={
        <>
          {item.saved_by ? `${item.saved_by} · ` : ""}
          {item.saved_at
            ? new Date(item.saved_at).toLocaleDateString("ar")
            : new Date(item.created_at).toLocaleDateString("ar")}
        </>
      }
      canRename={canRename}
      canDelete={canDelete}
      onDelete={onDelete}
      onRename={async (name) => {
        await Transcripts_APIs.save(item.id, { name });
        onRenamed();
      }}
      isDeleting={isDeleting}
      extraActions={
        item.transcript ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((value) => !value)}
          >
            <ChevronDown
              className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "إخفاء" : "عرض"}
          </Button>
        ) : null
      }
    >
      {expanded && item.transcript ? (
        <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">
          {item.transcript}
        </p>
      ) : null}
    </VoiceAssetRow>
  );
}

export function TranscriptsLibraryPage() {
  const { user } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();

  return (
    <VoiceAssetLibraryPage
      title="مكتبة النصوص المفرغة"
      queryKey={["transcripts-library"]}
      emptyMessage="لا توجد نصوص محفوظة بعد"
      fetchPage={(page) => Transcripts_APIs.list(page)}
      deleteItem={(id) => Transcripts_APIs.delete(id)}
      getDeleteLabel={(item) => item.name ?? item.original_filename}
      canRename={(item) => canSaveVoiceAsset(item, user)}
      canDelete={(item) => canDeleteVoiceAsset(item, user, isSuperAdmin)}
      renderItem={(props) => <TranscriptRow key={props.item.id} {...props} />}
    />
  );
}
