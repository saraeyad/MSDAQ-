import type { ApiResponse } from "../types/api";
import API from "./api.repository";

export type SmartEditorTool =
  | "rewrite-fusha"
  | "neutralize-bias"
  | "remove-discrimination"
  | "bullet-points";

export const SMART_EDITOR_TOOLS: SmartEditorTool[] = [
  "rewrite-fusha",
  "neutralize-bias",
  "remove-discrimination",
  "bullet-points",
];

export const SMART_EDITOR_TEXT_MAX_LENGTH = 10_000;

export type SmartEditorRewriteData = {
  original: string;
  result: string;
};

export type SmartEditorBulletsData = {
  original: string;
  points: string[];
};

export type SmartEditorResultData = SmartEditorRewriteData | SmartEditorBulletsData;

export function isBulletPointsResult(
  data: SmartEditorResultData,
): data is SmartEditorBulletsData {
  return "points" in data;
}

const SmartEditor_APIs = {
  run: async (tool: SmartEditorTool, text: string) => {
    const response = await API.post<ApiResponse<SmartEditorResultData>>(
      `/api/journalist/smart-editor/${tool}`,
      { text },
    );

    return {
      data: response.data,
    };
  },
};

export default SmartEditor_APIs;
