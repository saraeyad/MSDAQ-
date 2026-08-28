import type { User } from "./admin";
import type { StaffMediaType } from "./articles";

export type CalendarRecurrence = "none" | "daily" | "weekly" | "monthly";
export type CalendarItemType = "task" | "event" | "article";
export type TaskPriority = "low" | "medium" | "high";
export type TaskOccurrenceStatus = "pending" | "done" | "overdue";
export type CalendarMoveScope = "all" | "single";

export interface TaskFeedMeta {
  priority: TaskPriority;
  status: TaskOccurrenceStatus;
  is_recurring: boolean;
  occurrence_date: string;
  assignees: Pick<User, "id" | "name">[];
}

export interface EventFeedMeta {
  is_recurring: boolean;
  occurrence_date: string;
  participants: Pick<User, "id" | "name">[];
}

export interface ArticleFeedMeta {
  media_type: StaffMediaType;
  author: string;
  category: { slug: string; name_ar: string };
}

export interface CalendarFeedItem {
  type: CalendarItemType;
  id: string;
  source_id: number | string;
  title: string;
  start_at: string;
  end_at: string | null;
  color: string | null;
  meta: TaskFeedMeta | EventFeedMeta | ArticleFeedMeta;
}

export interface CalendarTask {
  id: number;
  title: string;
  description?: string | null;
  due_at: string;
  priority: TaskPriority;
  color?: string | null;
  recurrence?: CalendarRecurrence;
  recurrence_end_at?: string | null;
  creator: Pick<User, "id" | "name">;
  assignees: Pick<User, "id" | "name">[];
  created_at: string;
}

export interface CreateCalendarTaskPayload {
  title: string;
  description?: string;
  due_at: string;
  priority?: TaskPriority;
  color?: string;
  recurrence?: CalendarRecurrence;
  recurrence_end_at?: string;
  assignees?: number[];
}

export interface UpdateCalendarTaskPayload
  extends Partial<CreateCalendarTaskPayload> {}

export interface CalendarEventRecord {
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  starts_at: string;
  ends_at?: string | null;
  recurrence?: CalendarRecurrence;
  recurrence_end_at?: string | null;
  creator: Pick<User, "id" | "name">;
  participants: Pick<User, "id" | "name">[];
  created_at?: string;
}

export interface CreateCalendarEventRecordPayload {
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  color?: string;
  recurrence?: CalendarRecurrence;
  recurrence_end_at?: string;
  participants?: number[];
}

export interface UpdateCalendarEventRecordPayload
  extends Partial<CreateCalendarEventRecordPayload> {}

export interface UserPickerItem {
  id: number;
  name: string;
}

export interface TaskOccurrencePayload {
  occurrence_date: string;
}

export interface CalendarMovePayload {
  occurrence_date: string;
  moved_to: string;
  scope: CalendarMoveScope;
}

export interface CalendarDateRange {
  start: string;
  end: string;
}

export interface CalendarFeedQuery extends CalendarDateRange {
  types?: CalendarItemType[];
}

export interface CalendarTaskListQuery {
  priority?: TaskPriority;
  recurrence?: CalendarRecurrence;
  creator?: number;
  assignee?: number;
  search?: string;
  per_page?: number;
}

export interface CalendarEventListQuery {
  recurrence?: CalendarRecurrence;
  creator?: number;
  participant?: number;
  search?: string;
  per_page?: number;
}
