import { statsRepository } from "./stats.repository.ts";

export const statsService = {
  async getPlatformStats() {
    return statsRepository.getPlatformStats();
  },
};
