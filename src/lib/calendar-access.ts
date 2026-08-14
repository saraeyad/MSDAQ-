import type { AuthUser } from "@/context/types";
import type {
  CalendarEventRecord,
  CalendarFeedItem,
  CalendarTask,
} from "@/types";
import { isTaskMeta } from "@/lib/calendar-feed";

export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return (
    user?.roles.some((role) => /super\s*admin/i.test(role)) ?? false
  );
}

export function canManageTask(
  _task: CalendarTask,
  user: AuthUser | null | undefined,
  hasManageTasks: boolean,
): boolean {
  return Boolean(hasManageTasks && user);
}

export function canManageEvent(
  _event: CalendarEventRecord,
  user: AuthUser | null | undefined,
  hasManageEvents: boolean,
): boolean {
  return Boolean(hasManageEvents && user);
}

function isTaskAssigneeOrCreator(
  item: CalendarFeedItem,
  user: AuthUser,
  task?: CalendarTask | null,
): boolean {
  if (!isTaskMeta(item)) return false;
  if (item.meta.assignees.some((assignee) => assignee.id === user.id)) {
    return true;
  }
  return task?.creator.id === user.id;
}

export function canCompleteTaskOccurrence(
  item: CalendarFeedItem,
  user: AuthUser | null | undefined,
  hasCompleteOwnTasks: boolean,
  task?: CalendarTask | null,
): boolean {
  if (!hasCompleteOwnTasks || !user || !isTaskMeta(item)) return false;
  if (item.meta.status !== "pending") return false;
  return isTaskAssigneeOrCreator(item, user, task) || isSuperAdmin(user);
}

export function canReopenTaskOccurrence(
  item: CalendarFeedItem,
  user: AuthUser | null | undefined,
  hasCompleteOwnTasks: boolean,
  task: CalendarTask | null | undefined,
  hasManageTasks: boolean,
): boolean {
  if (!user || !isTaskMeta(item)) return false;
  if (item.meta.status !== "done") return false;
  if (task && canManageTask(task, user, hasManageTasks)) return true;
  if (!hasCompleteOwnTasks) return false;
  return isTaskAssigneeOrCreator(item, user, task) || isSuperAdmin(user);
}
