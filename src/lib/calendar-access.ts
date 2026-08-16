import type { AuthUser } from "@/context/types";
import type {
  CalendarEventRecord,
  CalendarFeedItem,
  CalendarTask,
} from "@/types";
import { isTaskMeta } from "@/lib/calendar-feed";

export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return user?.roles.some((role) => /super[\s-]*admin/i.test(role)) ?? false;
}

export function isAdminRole(user: AuthUser | null | undefined): boolean {
  return (
    isSuperAdmin(user) ||
    (user?.roles.some((role) => /^admin$/i.test(role.trim())) ?? false)
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
  hasManageTasks = false,
): boolean {
  if (!user || !isTaskMeta(item)) return false;
  if (item.meta.status !== "pending" && item.meta.status !== "overdue") {
    return false;
  }
  if (isAdminRole(user) || hasManageTasks) return true;
  if (!hasCompleteOwnTasks) return false;
  return isTaskAssigneeOrCreator(item, user, task);
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
  if (isAdminRole(user)) return true;
  if (!hasCompleteOwnTasks) return false;
  return isTaskAssigneeOrCreator(item, user, task);
}
