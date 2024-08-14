export abstract class BookmarkNavigationStrategy {
  abstract navigateBookmark(link: string, isOpenInSeparateTab?: boolean): void;
}
