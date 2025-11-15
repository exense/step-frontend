export abstract class Reloadable {
  abstract reload(isCausedByProjectChange?: boolean): void;
}
