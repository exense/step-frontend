import { Signal } from '@angular/core';

export abstract class DragDropContainerService {
  readonly animatedPreview?: Signal<boolean>;
  abstract getPreviewNode(): HTMLElement | undefined;
  abstract getImageContainer(): HTMLElement | undefined;
  abstract setIsDragStarted(value: boolean): void;
}
