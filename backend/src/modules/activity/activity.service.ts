import type { ActivityChanges } from "../../db/schema/index.ts";
import { activityRepository } from "./activity.repository.ts";
import type { ActivityQuery } from "./activity.schemas.ts";

/** The fields of `input` whose value differs from `before`, as { from, to } */
export function diffChanges(
  before: Record<string, unknown>,
  input: Record<string, unknown>,
): ActivityChanges {
  const changes: ActivityChanges = {};
  for (const [field, to] of Object.entries(input)) {
    if (to !== undefined && before[field] !== to)
      changes[field] = { from: before[field], to };
  }
  return changes;
}

/** Values of a created row, as { to } */
export function createdChanges(
  values: Record<string, unknown>,
): ActivityChanges {
  const changes: ActivityChanges = {};
  for (const [field, to] of Object.entries(values))
    if (to !== undefined) changes[field] = { to };
  return changes;
}

/** Values of a deleted row, as { from } */
export function deletedChanges(
  values: Record<string, unknown>,
): ActivityChanges {
  const changes: ActivityChanges = {};
  for (const [field, from] of Object.entries(values)) changes[field] = { from };
  return changes;
}

export const activityService = {
  async list(query: ActivityQuery) {
    const { data, total } = await activityRepository.findPage(query);
    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },
};
