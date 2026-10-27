import { and, asc, count, desc, eq, type SQL } from "drizzle-orm";
import { db, type DbOrTx } from "../../db/client.ts";
import {
  courseActivity,
  courses,
  type NewCourseActivity,
  users,
} from "../../db/schema/index.ts";
import type { ActivityQuery } from "./activity.schemas.ts";

export const activityRepository = {
  /** Call with the transaction of the change, so the log and the change commit together */
  async log(entry: NewCourseActivity, executor: DbOrTx) {
    await executor.insert(courseActivity).values(entry);
  },

  async findPage({ page, limit, courseId, actorId, action }: ActivityQuery) {
    const filters: SQL[] = [];
    if (courseId) filters.push(eq(courseActivity.courseId, courseId));
    if (actorId) filters.push(eq(courseActivity.actorId, actorId));
    if (action) filters.push(eq(courseActivity.action, action));
    const where = filters.length > 0 ? and(...filters) : undefined;

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: courseActivity.id,
          action: courseActivity.action,
          entityId: courseActivity.entityId,
          changes: courseActivity.changes,
          createdAt: courseActivity.createdAt,
          course: { id: courses.id, title: courses.title },
          actor: { id: users.id, fullName: users.fullName, role: users.role },
        })
        .from(courseActivity)
        .innerJoin(courses, eq(courseActivity.courseId, courses.id))
        .leftJoin(users, eq(courseActivity.actorId, users.id))
        .where(where)
        .orderBy(desc(courseActivity.createdAt), asc(courseActivity.id))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ value: count() }).from(courseActivity).where(where),
    ]);
    return { data, total: totalResult[0]?.value ?? 0 };
  },
};
