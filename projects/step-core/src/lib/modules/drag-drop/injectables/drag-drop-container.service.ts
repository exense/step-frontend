export abstract class DragDropContainerService {
  abstract getPreviewNode(): HTMLElement | undefined;
  abstract getImageContainer(): HTMLElement | undefined;
  abstract setIsDragStarted(value: boolean): void;
}
