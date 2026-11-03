import * as React from "react";
import {
  CounterBadge,
  ErrorState,
  SkeletonText,
  Sortable,
  SortableGroup,
  SortableHandle,
  SortableItem,
  toast,
  type SortableEndData,
} from "yugen-ui";
import { TASK_STATUSES, type Task, type TaskBoard, type TaskStatus } from "../api";
import { useAdmin } from "../context";
import { PageHeader, Section } from "../ui";
import { useQuery } from "../useQuery";

type Columns = Record<TaskStatus, string[]>;

const idsOf = (board: TaskBoard): Columns => ({
  todo: board.todo.map((t) => t.id),
  doing: board.doing.map((t) => t.id),
  done: board.done.map((t) => t.id),
});

/** Takes the card out of every column and puts it in `status` at `index`. */
function place(columns: Columns, id: string, status: TaskStatus, index: number): Columns {
  const next = { ...columns };
  for (const s of TASK_STATUSES) next[s] = columns[s].filter((t) => t !== id);
  next[status].splice(index, 0, id);
  return next;
}

/**
 * The team board. A move shows right away (Sortable changes the order while the card is dragged) and is saved when the
 * card is dropped; if the request fails, the card goes back to where it was and a toast says so.
 */
export default function BoardPage() {
  const { t, api } = useAdmin();
  const loaded = useQuery((signal) => api.listTasks(signal), [api]);
  const tasks = React.useMemo(
    () => new Map<string, Task>(TASK_STATUSES.flatMap((s) => loaded.data?.[s] ?? []).map((task) => [task.id, task])),
    [loaded.data],
  );
  const [moved, setMoved] = React.useState<Columns>();
  const columns = moved ?? (loaded.data && idsOf(loaded.data));

  const save = ({ item, from, to, canceled }: SortableEndData) => {
    if (canceled || (from.list === to.list && from.index === to.index)) return;
    api.moveTask(item, to.list as TaskStatus, to.index).catch(() => {
      setMoved((current) => current && place(current, item, from.list as TaskStatus, from.index));
      toast({ intent: "error", title: t.board.moveFailed(tasks.get(item)?.title ?? item), body: t.common.rolledBack });
    });
  };

  return (
    <>
      <PageHeader title={t.board.title} description={t.board.description} />
      {!columns ? (
        loaded.status === "error" ? (
          <ErrorState title={t.common.loadFailed} description={t.common.loadFailedBody} onRetry={loaded.retry} />
        ) : (
          <SkeletonText lines={6} />
        )
      ) : (
        <div className="grid items-start gap-4 @3xl/app-shell:grid-cols-3">
          <SortableGroup value={columns} onValueChange={(next) => setMoved(next as Columns)} onSortEnd={save}>
            {TASK_STATUSES.map((status) => (
              <Section
                key={status}
                title={t.board.columns[status]}
                action={<CounterBadge aria-hidden count={columns[status].length} showZero appearance="ghost" color="informative" />}
              >
                <Sortable
                  listId={status}
                  label={t.board.columns[status]}
                  role="list"
                  // An empty column stays a drop target.
                  className="flex min-h-16 flex-col gap-2 rounded-large transition-colors empty:border empty:border-dashed empty:border-stroke-2 data-over:bg-background-2"
                >
                  {columns[status].map((id) => (
                    <SortableItem
                      key={id}
                      value={id}
                      role="listitem"
                      className="flex items-start gap-2 rounded-large border border-stroke-2 bg-background-1 p-2 text-body1"
                    >
                      <SortableHandle />
                      <span className="min-w-0 flex-1 py-0.5 wrap-break-word">{tasks.get(id)?.title}</span>
                    </SortableItem>
                  ))}
                </Sortable>
              </Section>
            ))}
          </SortableGroup>
        </div>
      )}
    </>
  );
}
