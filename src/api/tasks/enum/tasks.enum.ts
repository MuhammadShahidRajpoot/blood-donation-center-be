export enum task_status_enum {
  not_started = 'Not Started',
  in_process = 'In Process',
  deferred = 'Deferred',
  completed = 'Completed',
  cancelled = 'Cancelled',
}

export enum task_due_date_enum {
  all = 'All',
  past_date = 'Past Due',
  due_this_week = 'Due This Week',
  due_next_week = 'Due Next Week',
}

export const TaskDueDateEnumKeys = {
  1: task_due_date_enum.all,
  2: task_due_date_enum.past_date,
  3: task_due_date_enum.due_this_week,
  4: task_due_date_enum.due_next_week,
};
