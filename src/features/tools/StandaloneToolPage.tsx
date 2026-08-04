import { Card, CardContent } from "@/components/ui/card";
import { usePermission } from "@/hooks/usePermission";
import { ROUTES } from "@/router/routes";
import { Link, useParams } from "react-router-dom";
import { isSmartEditorSlug } from "./smart-editor/config";
import { getToolBySlug } from "./tool-config";
import { AiDetectionToolPage } from "./pages/AiDetectionToolPage";
import { CredibilityCheckToolPage } from "./pages/CredibilityCheckToolPage";
import { DomainCheckerToolPage } from "./pages/DomainCheckerToolPage";
import { GeneratedAudiosLibraryPage } from "./pages/GeneratedAudiosLibraryPage";
import { LocalizationToolPage } from "./pages/LocalizationToolPage";
import { ReverseImageToolPage } from "./pages/ReverseImageToolPage";
import { SmartEditorToolPage } from "./pages/SmartEditorToolPage";
import { SpeechToTextToolPage } from "./pages/SpeechToTextToolPage";
import { StandardsCheckToolPage } from "./pages/StandardsCheckToolPage";
import { TextToSpeechToolPage } from "./pages/TextToSpeechToolPage";
import { TranscriptsLibraryPage } from "./pages/TranscriptsLibraryPage";

function ToolForbidden() {
  return (
    <Card>
      <CardContent className="space-y-3 p-8 text-center">
        <p className="font-medium">لا تملك صلاحية استخدام هذه الأداة</p>
        <Link to={ROUTES.NEWSROOM_TOOLS} className="text-sm text-primary hover:underline">
          العودة للأدوات
        </Link>
      </CardContent>
    </Card>
  );
}

function ToolNotFound() {
  return (
    <Card>
      <CardContent className="space-y-3 p-8 text-center">
        <p className="font-medium">أداة غير معروفة</p>
        <Link to={ROUTES.NEWSROOM_TOOLS} className="text-sm text-primary hover:underline">
          العودة للأدوات
        </Link>
      </CardContent>
    </Card>
  );
}

export default function StandaloneToolPage() {
  const { tool } = useParams();
  const config = getToolBySlug(tool);
  const allowed = usePermission(config?.permission ?? "");

  if (!config) {
    return <ToolNotFound />;
  }

  if (!allowed) {
    return <ToolForbidden />;
  }

  if (isSmartEditorSlug(config.slug)) {
    return <SmartEditorToolPage slug={config.slug} />;
  }

  switch (config.slug) {
    case "text-to-speech":
      return <TextToSpeechToolPage />;
    case "speech-to-text":
      return <SpeechToTextToolPage />;
    case "generated-audios":
      return <GeneratedAudiosLibraryPage />;
    case "transcripts":
      return <TranscriptsLibraryPage />;
    case "standards-check":
      return <StandardsCheckToolPage />;
    case "credibility-check":
      return <CredibilityCheckToolPage />;
    case "localization":
      return <LocalizationToolPage />;
    case "reverse-image":
      return <ReverseImageToolPage />;
    case "ai-detection":
      return <AiDetectionToolPage />;
    case "domain-checker":
      return <DomainCheckerToolPage />;
    default:
      return <ToolNotFound />;
  }
}
