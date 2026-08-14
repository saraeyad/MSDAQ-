import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Plus,
} from "lucide-react";

const VIEW_OPTIONS = [
  { value: "dayGridMonth", label: "عرض شهري" },
  { value: "timeGridWeek", label: "عرض أسبوعي" },
  { value: "listWeek", label: "عرض قائمة" },
] as const;

export type CalendarViewType = (typeof VIEW_OPTIONS)[number]["value"];

interface CalendarViewHeaderProps {
  title: string;
  monthIconLabel: string;
  dayNumber: string;
  weekLabel: string;
  rangeLabel: string;
  currentView: CalendarViewType;
  canCreate: boolean;
  hasManageTasks: boolean;
  hasManageEvents: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarViewType) => void;
  onAddTask: () => void;
  onAddEvent: () => void;
  className?: string;
}

export function CalendarViewHeader({
  title,
  monthIconLabel,
  dayNumber,
  weekLabel,
  rangeLabel,
  currentView,
  canCreate,
  hasManageTasks,
  hasManageEvents,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onAddTask,
  onAddEvent,
  className,
}: CalendarViewHeaderProps) {
  const showAddMenu = hasManageTasks && hasManageEvents;

  return (
    <div className={cn("calendar-view-header", className)}>
      <div className="calendar-view-header__info">
        <div className="calendar-view-header__title-row">
          <div className="calendar-view-header__month-icon" aria-hidden>
            <div className="calendar-view-header__month-icon-top">
              {monthIconLabel}
            </div>
            <div className="calendar-view-header__month-icon-day">{dayNumber}</div>
          </div>
          <div className="calendar-view-header__titles">
            <div className="calendar-view-header__heading">
              <h3 className="calendar-view-header__title">{title}</h3>
              <span className="calendar-view-header__week-badge">{weekLabel}</span>
            </div>
            <p className="calendar-view-header__range">{rangeLabel}</p>
          </div>
        </div>
      </div>

      <div className="calendar-view-header__controls">
        <div className="calendar-view-header__nav">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="calendar-view-header__nav-btn"
            onClick={onPrev}
            aria-label="الفترة السابقة"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="calendar-view-header__today-btn"
            onClick={onToday}
          >
            اليوم
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="calendar-view-header__nav-btn"
            onClick={onNext}
            aria-label="الفترة التالية"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>

        <div className="calendar-view-header__view-wrap">
          <Select
            value={currentView}
            onValueChange={(value) => onViewChange(value as CalendarViewType)}
          >
            <SelectTrigger className="calendar-view-header__view-select" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {VIEW_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canCreate &&
          (showAddMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" className="calendar-view-header__add-btn gap-1.5">
                  <Plus className="size-4" />
                  إضافة
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasManageTasks && (
                  <DropdownMenuItem onClick={onAddTask} className="gap-2">
                    <ClipboardList className="size-4" />
                    مهمة جديدة
                  </DropdownMenuItem>
                )}
                {hasManageEvents && (
                  <DropdownMenuItem onClick={onAddEvent} className="gap-2">
                    <CalendarPlus className="size-4" />
                    فعالية جديدة
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : hasManageTasks ? (
            <Button type="button" className="calendar-view-header__add-btn gap-1.5" onClick={onAddTask}>
              <Plus className="size-4" />
              مهمة جديدة
            </Button>
          ) : (
            <Button type="button" className="calendar-view-header__add-btn gap-1.5" onClick={onAddEvent}>
              <Plus className="size-4" />
              فعالية جديدة
            </Button>
          ))}
      </div>
    </div>
  );
}
