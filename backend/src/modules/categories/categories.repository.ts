import { asc } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { categories } from "../../db/schema/index.ts";

export const categoriesRepository = {
  async findAll() {
    return db.select().from(categories).orderBy(asc(categories.name));
  },
};
