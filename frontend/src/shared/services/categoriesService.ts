import { request } from "@/shared/api/http";
import type { Category } from "@/shared/types/category";

export const categoriesService = {
  async list(): Promise<Category[]> {
    const { categories } = await request<{ categories: Category[] }>(
      "/categories",
    );
    return categories;
  },
};
