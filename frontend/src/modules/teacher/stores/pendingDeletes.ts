import { create } from "zustand";

type DeleteStatus = "undoable" | "deleted";

type PendingDeletesState = {
  deletes: ReadonlyMap<string, DeleteStatus>;
  set: (id: string, status: DeleteStatus) => void;
  restore: (id: string) => void;
};

/**
 * Modules and lessons deleted from the syllabus editor. It lives outside the
 * editor so they stay hidden if the teacher opens another course and comes
 * back before the toast closes and the DELETE is sent.
 */
export const usePendingDeletes = create<PendingDeletesState>()((set) => ({
  deletes: new Map(),
  set: (id, status) =>
    set(({ deletes }) => ({ deletes: new Map(deletes).set(id, status) })),
  restore: (id) =>
    set(({ deletes }) => {
      const next = new Map(deletes);
      next.delete(id);
      return { deletes: next };
    }),
}));
