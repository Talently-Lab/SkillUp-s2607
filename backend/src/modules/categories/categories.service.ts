import { categoriesRepository } from "./categories.repository.ts";

export const categoriesService = {
  async list() {
    return categoriesRepository.findAll();
  },
};
