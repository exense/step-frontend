export abstract class HeatmapPersistenceConfig {
  abstract readonly heatmapId: string;
  abstract readonly storePagination?: boolean;
}
