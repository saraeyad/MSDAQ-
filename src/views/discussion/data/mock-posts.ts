import type { DiscussionCategoryStat } from "@/types/discussion";

export function getMockCategoryStats(): DiscussionCategoryStat[] {
  return [
    { tag: "ethics", count: 0 },
    { tag: "accountability", count: 0 },
    { tag: "personal_story", count: 0 },
  ];
}
