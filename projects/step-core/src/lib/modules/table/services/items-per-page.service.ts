export abstract class ItemsPerPageService {
  abstract getItemsPerPage(loadedUserPreferences: (itemsPerPage: number) => void): number[];
}
