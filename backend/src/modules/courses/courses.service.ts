import { NotFoundError } from "../../shared/errors/app-error.ts";
import { coursesRepository } from "./courses.repository.ts";
import type { CoursesQuery } from "./courses.schemas.ts";

export const coursesService = {
  async list(query: CoursesQuery) {
    const { data, total } = await coursesRepository.findMany(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  },

  async getById(id: string) {
    const course = await coursesRepository.findById(id);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },
};
